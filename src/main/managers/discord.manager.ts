import {
  AudioPlayer,
  AudioResource,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Client, GatewayIntentBits, VoiceChannel } from 'discord.js';
import {
  ChannelData,
  DiscordState,
  DiscordStateConnected,
  DiscordStateType,
  GuildWithChannels,
  JoinChannelRequest,
} from '@shared/models/discord.model';
import { PassThrough, Writable } from 'node:stream';
import ffmpegPath from 'ffmpeg-static';
import { JitterBuffer } from '../services/jitter-buffer';
import {
  NetworkHealthMonitor,
  NetworkQuality,
} from '../services/network-health-monitor';
import { ipcMain } from 'electron';
import { DiscordChannel } from '@shared/models/channels.model';
import { ViewManager } from './view.manager';
import { opus } from 'prism-media';
import Encoder = opus.Encoder;
import { Logger } from '../utils/logger';

export class DiscordManager {
  private static instance: DiscordManager;

  private audioPlayer?: AudioPlayer;
  private client?: Client;
  private audioResource?: AudioResource;
  private connection?: VoiceConnection;
  private jitterBuffer?: JitterBuffer;
  private networkMonitor?: NetworkHealthMonitor;
  private voiceDataStream?: PassThrough; // Stream for voice data from WebSocket
  private encoder?: Encoder; // Opus encoder for voice data
  private currentBitrate = 128; // kbps
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelayMs = 3000;
  private isStreamEnabled = true;
  private pauseDrain: Writable;
  private state: DiscordState = { type: DiscordStateType.NONE };
  private logger = new Logger('DiscordManager', 'cyan');

  private constructor() {
    this.pauseDrain = new Writable();
    this.pauseDrain._write = (_, __, callback) => {
      callback();
    };
  }

  public static getInstance(): DiscordManager {
    if (!DiscordManager.instance) {
      DiscordManager.instance = new DiscordManager();
      DiscordManager.instance.registerChannels();
    }
    return DiscordManager.instance;
  }

  private registerChannels(): void {
    ipcMain.handle(DiscordChannel.GET_CHANNELS, async (_) => {
      return await this.getAvailableChannels();
    });
    ipcMain.handle(
      DiscordChannel.JOIN_CHANNEL,
      async (_, request: JoinChannelRequest) => {
        this.logger.log('Joining channel', request);
        return await this.joinChannel(request.guildId, request.channelId);
      },
    );
    ipcMain.handle(DiscordChannel.DISCONNECT, async (_) => {
      this.logger.log('Disconnecting from current channel');
      return await this.disconnect();
    });
  }

  async updateState(guildId?: string, channelId?: string): Promise<void> {
    if ((!guildId && !channelId) || !this.client) {
      this.state = { type: DiscordStateType.NONE };
      await this.broadcastDiscordState();
      return;
    }
    const channel = (await this.client.channels.fetch(
      channelId!,
    )) as VoiceChannel | null;
    if (!channel) {
      this.state = { type: DiscordStateType.NONE };
      await this.broadcastDiscordState();
      return;
    }
    this.state = {
      type: DiscordStateType.CONNECTED,
      guildId: guildId!,
      guildName: channel.guild.name,
      channelId: channelId!,
      channelName: channel.name,
    };
    await this.broadcastDiscordState();
  }

  /**
   * Creates a new AudioPlayer instance with error and state change handling.
   */
  createAudioPlayer(): void {
    if (this.audioPlayer) {
      this.audioPlayer.stop(true);
      this.audioPlayer = undefined;
    }

    this.audioPlayer = new AudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
        maxMissedFrames: 5000, // Increased tolerance for unstable networks
      },
    });
    this.logger.log('AudioPlayer created');
    this.audioPlayer.on('error', (err) => {
      this.logger.logErrorMessage('AudioPlayer error', { error: err });
    });
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      this.logger.log('AudioPlayer state change', {
        oldState: oldState.status,
        newState: newState.status,
      });
    });
  }

  async connect(token: string): Promise<void> {
    if (this.isConnecting) {
      this.logger.logWarning('Connection already in progress');
      return;
    }

    if (this.client) {
      await this.client.destroy();
      this.client = undefined;
    }

    this.isConnecting = true;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    // Initialize network monitoring
    this.networkMonitor = new NetworkHealthMonitor();
    this.networkMonitor.onQualityChanged((quality: NetworkQuality) => {
      //this.logger.log('Network quality changed', quality);
    });
    this.networkMonitor.onBitrateRecommended((rec) => {
      if (rec.bitrate !== this.currentBitrate) {
        this.logger.log('Adjusting bitrate', {
          old: this.currentBitrate,
          new: rec.bitrate,
          newQuality: rec.quality,
        });
        this.currentBitrate = rec.bitrate;
        this.updateAudioResourceBitrate();
      }
    });
    this.networkMonitor.startMonitoring(5000);

    const readyPromise = new Promise<void>((resolve) => {
      this.resolveOnceClientIsReady(resolve);
    });

    try {
      await this.client.login(token);
      await readyPromise;
      this.reconnectAttempts = 0;
      this.logger.log('Successfully connected to Discord');
    } catch (error) {
      this.logger.logErrorMessage('Connection failed', { error });
      await this.handleConnectionFailure(token);
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection || this.state.type === DiscordStateType.NONE) {
      this.logger.logWarning('No active connection to disconnect');
      return;
    }

    // Stop player first
    if (this.audioPlayer) {
      this.audioPlayer.stop(true);
    }

    // Unpipe and destroy encoder to prevent premature close errors
    if (this.encoder && this.voiceDataStream) {
      this.logger.log('Unpipping encoder from voice data stream');
      try {
        this.encoder.unpipe(this.voiceDataStream);
      } catch (err) {
        this.logger.logWarning('Error unpipping encoder', { error: err });
      }
    }

    if (this.encoder) {
      this.logger.log('Destroying encoder');
      try {
        this.encoder.destroy();
      } catch (err) {
        this.logger.logWarning('Error destroying encoder', { error: err });
      }
      this.encoder = undefined;
    }

    // Destroy audio resource stream
    if (this.audioResource?.playStream) {
      this.logger.log('Destroying audio resource stream');
      try {
        this.audioResource.playStream.destroy();
      } catch (err) {
        this.logger.logWarning('Error destroying audio resource stream', {
          error: err,
        });
      }
    }
    this.audioResource = undefined;

    // Destroy voice data stream
    if (this.voiceDataStream) {
      this.logger.log('Destroying voice data stream');
      try {
        this.voiceDataStream.destroy();
      } catch (err) {
        this.logger.log('Error destroying voice data stream', { error: err });
      }
      this.voiceDataStream = undefined;
    }

    // Destroy connection
    this.connection.destroy();
    this.connection = undefined;
    this.jitterBuffer = undefined;

    await this.updateState();
  }

  async handleVoiceData(buffer: Buffer<ArrayBuffer>): Promise<void> {
    // Ensure we have a voice data stream and encoder for the current connection
    if (!this.voiceDataStream || !this.encoder) {
      if (Math.random() <= 0.0001) {
        this.logger.logWarning(
          'Voice data received but no active voice connection',
        );
      }
      return;
    }

    try {
      // The encoder is a duplex stream (Transform stream)
      // Write PCM audio data to the encoder, which outputs Opus-encoded frames
      // The encoder will automatically encode and write to the voice data stream
      this.encoder.write(Buffer.from(buffer));
    } catch (error) {
      this.logger.logErrorMessage('Error handling voice data', { error });
    }
  }

  async joinChannel(guildId: string, channelId: string): Promise<void> {
    if (!this.client) {
      this.logger.logErrorMessage('Client not initialized');
      return;
    }

    try {
      // Clean up old playback
      if (this.audioPlayer) {
        this.audioPlayer.stop(true);
      }
      if (this.audioResource?.playStream) {
        this.audioResource.playStream.destroy();
      }
      this.audioResource = undefined;

      // Destroy old encoder
      if (this.encoder) {
        try {
          this.encoder.destroy();
        } catch (err) {
          this.logger.logWarning('Error destroying old encoder', {
            error: err,
          });
        }
        this.encoder = undefined;
      }

      // Destroy old voice data stream
      if (this.voiceDataStream) {
        try {
          this.voiceDataStream.destroy();
        } catch (err) {
          this.logger.logWarning('Error destroying old voice data stream', {
            error: err,
          });
        }
        this.voiceDataStream = undefined;
      }

      const channel = (await this.client.channels.fetch(
        channelId,
      )) as VoiceChannel | null;
      if (!channel) {
        this.logger.log('Channel not found', { channelId });
        return;
      }

      this.connection?.destroy();
      this.connection = undefined;

      this.createAudioPlayer();

      this.connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      this.appendConnectionEventHandlers(guildId, channelId);
      this.reconnectAttempts = 0;
    } catch (error) {
      this.logger.logErrorMessage('Failed to join channel', { error });
    }
  }

  /**
   * Get current network health information
   */
  getNetworkHealth(): {
    quality: string;
    latency: number;
    jitter: number;
    packetLoss: number;
    bufferHealth: string;
  } | null {
    if (!this.networkMonitor || !this.jitterBuffer) {
      return null;
    }

    const quality = this.networkMonitor.getQuality();
    const bufferStats = this.jitterBuffer.getStats();

    return {
      quality: quality.quality,
      latency: quality.latencyMs,
      jitter: quality.jitterMs,
      packetLoss: quality.packetLossPercent,
      bufferHealth: `${bufferStats.currentBufferSize}/${bufferStats.targetBufferSize} frames`,
    };
  }

  /**
   * Pauses audio stream by piping the stream to a drain.
   *
   * Requires `audioPlayer` and `audioResource` to be initialized.
   */
  stopStreaming(): void {
    if (this.isStreamEnabled && this.audioPlayer) {
      if (this.audioResource?.playStream) {
        this.audioResource.playStream.pipe(this.pauseDrain);
      }

      this.isStreamEnabled = !this.audioPlayer.pause(true);
      this.logger.log('Streaming stopped');
    }
  }

  /**
   * Resumes audio stream by unpiping from the drain.
   *
   * Requires `audioPlayer` and `audioResource` to be initialized.
   */
  resumeStreaming(): void {
    if (!this.isStreamEnabled && this.audioPlayer) {
      if (this.audioResource?.playStream) {
        this.audioResource.playStream.unpipe(this.pauseDrain);
      }
      this.audioPlayer.unpause();
      this.logger.log('Streaming resumed');
    }
    this.isStreamEnabled = true;
  }

  /**
   * Starts streaming audio with jitter buffer for stability.
   *
   * Initializes Opus encoder, voice data stream, and jitter buffer.
   * Requires `audioPlayer` and `connection` to be initialized.
   */
  startStreaming() {
    if (!this.audioPlayer || !this.connection) {
      throw new Error(
        '[DiscordManager] Cannot start stream without successful initial setup',
      );
    }

    try {
      // Create a fresh PassThrough stream for this connection
      // This will receive Opus-encoded frames from the encoder
      this.voiceDataStream = new PassThrough();

      this.logger.log('Initializing Opus encoder');
      // Create Opus encoder for PCM -> Opus conversion
      // Audio specs: 48kHz, 2 channels (stereo), 16-bit
      this.encoder = new Encoder({
        channels: 2,
        frameSize: 960,
        rate: 48000,
      });

      // Pipe encoder output to the voice data stream
      // This way, data written to the encoder will be encoded and output to the stream
      this.encoder.pipe(this.voiceDataStream);

      // Add error handlers to the encoder
      this.encoder.on('error', (err: Error) => {
        this.logger.logErrorMessage('Encoder error during streaming', {
          error: err,
        });
        this.audioPlayer?.stop(true);
      });

      this.encoder.on('close', () => {
        this.logger.log('Encoder closed');
      });

      // Initialize jitter buffer for stability
      // Frame size 1920 bytes = 960 samples * 2 bytes per 16-bit sample
      this.jitterBuffer = new JitterBuffer(1920, 200); // 1920 bytes frame, 200ms target

      // Subscribe the audio player to the connection
      this.connection.subscribe(this.audioPlayer);

      // Create audio resource from the voice data stream
      this.audioResource = createAudioResource(this.voiceDataStream, {
        inputType: StreamType.Opus,
        inlineVolume: true,
        silencePaddingFrames: 5,
        metadata: {
          ffmpegPath,
        },
      });

      // Set volume to normal
      this.audioResource.volume?.setVolume(1);

      // Add error handler to the audio resource stream
      this.audioResource.playStream.on('error', (err: Error) => {
        this.logger.logErrorMessage('PlayStream error during streaming', {
          error: err,
        });
      });

      // Start playing the resource
      this.audioPlayer.play(this.audioResource);

      if (this.jitterBuffer) {
        this.logger.log('Jitter buffer initialized', {
          bufferSize: this.jitterBuffer.getStats().targetBufferSize,
        });
      }
      this.logger.log('Started streaming with stability features enabled');
    } catch (error) {
      this.logger.logErrorMessage('Error starting stream', { error });
      throw error;
    }
  }

  async getAvailableChannels() {
    const guilds = await this.client?.guilds.fetch();
    const collection: GuildWithChannels[] = [];
    for (const guild of guilds?.values() || []) {
      const fetchedGuild = await guild.fetch();
      const guildChannels = await fetchedGuild.channels.fetch();
      const channels: ChannelData[] = [];
      for (const channel of guildChannels.values()) {
        if (channel?.isVoiceBased()) {
          channels.push({
            id: channel.id,
            name: channel.name,
          });
        }
      }
      collection.push({
        guildId: fetchedGuild.id,
        guildName: fetchedGuild.name,
        guildIconURL: fetchedGuild.iconURL() || undefined,
        channels,
      });
    }
    return collection;
  }

  private attemptReconnect(guildId: string, channelId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.log('Max reconnection attempts reached', {
        maxAttempts: this.maxReconnectAttempts,
      });
      this.updateState().then(() => {});
      return;
    }

    this.reconnectAttempts++;
    this.logger.logWarning('Attempting reconnect', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    });

    setTimeout(() => {
      this.joinChannel(guildId, channelId).catch(console.error);
    }, this.reconnectDelayMs);
  }

  private async handleConnectionFailure(token: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.logErrorMessage(
        'Max reconnection attempts reached, giving up',
      );
      return;
    }

    this.reconnectAttempts++;
    const delayMs =
      this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    this.logger.log('Retrying connection', {
      delayMs,
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    });

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await this.connect(token);
  }

  private updateAudioResourceBitrate(): void {
    if (!this.audioResource) {
      this.logger.logWarning('Cannot update bitrate: no audio resource');
      return;
    }

    // Note: Bitrate update depends on stream type and encoder configuration
    // This is typically handled by the encoder on the frontend or requires recreating the resource
    this.logger.log(
      'Bitrate update logic not implemented - requires resource recreation or encoder config change',
    );
  }

  private resolveOnceClientIsReady(resolve: () => void) {
    if (!this.client) {
      resolve();
      return;
    }
    this.client.once('ready', () => resolve());
  }

  /**
   * Initialize audio stream once connection is ready,
   * and set up reconnect on disconnection.
   *
   * Expects `audioPlayer` and `connection` to be initialized.
   *
   * Once ready, new audio resource is created and played.
   *
   * @param guildId ID of the guild (server)
   * @param channelId ID of the voice channel
   * @private
   */
  private appendConnectionEventHandlers(
    guildId: string,
    channelId: string,
  ): void {
    if (!this.connection) return;
    // Monitor connection status for unstable networks
    this.connection.on(VoiceConnectionStatus.Ready, () => {
      this.logger.log('Voice connection ready');
      this.startStreaming();
      this.updateState(guildId, channelId).then(() => {});
    });

    this.connection.on(VoiceConnectionStatus.Disconnected, () => {
      this.logger.logWarning('Voice connection disconnected');
      // Attempt to reconnect
      this.attemptReconnect(guildId, channelId);
    });

    this.connection.on(VoiceConnectionStatus.Destroyed, () => {
      this.logger.logWarning('Voice connection destroyed');
    });
  }

  private async broadcastDiscordState(): Promise<void> {
    const viewManager = await ViewManager.getInstance();
    viewManager.broadcast(DiscordChannel.STATE_UPDATE, undefined, this.state);
    this.logger.log('Broadcasted Discord state update', { state: this.state });
  }
}
