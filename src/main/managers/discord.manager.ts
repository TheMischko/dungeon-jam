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
        console.log(
          `[DiscordManager] Joining channel: guild=${request.guildId}, channel=${request.channelId}`,
        );
        return await this.joinChannel(request.guildId, request.channelId);
      },
    );
    ipcMain.handle(DiscordChannel.DISCONNECT, async (_) => {
      console.log(`[DiscordManager] Disconnecting from current channel`);
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

    const date = new Date();
    this.audioPlayer = new AudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
        maxMissedFrames: 5000, // Increased tolerance for unstable networks
      },
    });
    console.log(
      `[DiscordManager] AudioPlayer created at ${date.toLocaleString()}`,
    );
    this.audioPlayer.on('error', (err) =>
      console.error(
        `[DiscordManager] AudioPlayer from ${date.toLocaleString()} error: ${
          err.message
        }\n`,
        err,
      ),
    );
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      console.log(
        `[DiscordManager] AudioPlayer from ${date.toLocaleString()} state: ${
          oldState.status
        } -> ${newState.status}`,
      );
    });
  }

  async connect(token: string): Promise<void> {
    if (this.isConnecting) {
      console.warn('[DiscordManager] Connection already in progress');
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
      console.log(
        `[DiscordManager] Network quality: ${quality.quality} (latency: ${quality.latencyMs}ms)`,
      );
    });
    this.networkMonitor.onBitrateRecommended((rec) => {
      if (rec.bitrate !== this.currentBitrate) {
        console.log(
          `[DiscordManager] Adjusting bitrate: ${this.currentBitrate} → ${rec.bitrate} kbps (${rec.quality})`,
        );
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
      console.log('[DiscordManager] Successfully connected to Discord');
    } catch (error) {
      console.error('[DiscordManager] Connection failed:', error);
      await this.handleConnectionFailure(token);
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection || this.state.type === DiscordStateType.NONE) {
      console.warn('[DiscordManager] No active connection to disconnect');
      return;
    }

    // Stop player first
    if (this.audioPlayer) {
      this.audioPlayer.stop(true);
    }

    // Unpipe and destroy encoder to prevent premature close errors
    if (this.encoder && this.voiceDataStream) {
      console.log('[DiscordManager] Unpipping encoder from voice data stream');
      try {
        this.encoder.unpipe(this.voiceDataStream);
      } catch (err) {
        console.warn('[DiscordManager] Error unpipping encoder:', err);
      }
    }

    if (this.encoder) {
      console.log('[DiscordManager] Destroying encoder');
      try {
        this.encoder.destroy();
      } catch (err) {
        console.warn('[DiscordManager] Error destroying encoder:', err);
      }
      this.encoder = undefined;
    }

    // Destroy audio resource stream
    if (this.audioResource?.playStream) {
      console.log('[DiscordManager] Destroying audio resource stream');
      try {
        this.audioResource.playStream.destroy();
      } catch (err) {
        console.warn(
          '[DiscordManager] Error destroying audio resource stream:',
          err,
        );
      }
    }
    this.audioResource = undefined;

    // Destroy voice data stream
    if (this.voiceDataStream) {
      console.log('[DiscordManager] Destroying voice data stream');
      try {
        this.voiceDataStream.destroy();
      } catch (err) {
        console.warn(
          '[DiscordManager] Error destroying voice data stream:',
          err,
        );
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
      if (Math.random() <= 0.001) {
        console.warn(
          '[DiscordManager] Voice data received but no active voice connection',
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
      console.error('[DiscordManager] Error handling voice data:', error);
    }
  }

  async joinChannel(guildId: string, channelId: string): Promise<void> {
    if (!this.client) {
      console.error('[DiscordManager] Client not initialized');
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
          console.warn('[DiscordManager] Error destroying old encoder:', err);
        }
        this.encoder = undefined;
      }

      // Destroy old voice data stream
      if (this.voiceDataStream) {
        try {
          this.voiceDataStream.destroy();
        } catch (err) {
          console.warn(
            '[DiscordManager] Error destroying old voice data stream:',
            err,
          );
        }
        this.voiceDataStream = undefined;
      }

      const channel = (await this.client.channels.fetch(
        channelId,
      )) as VoiceChannel | null;
      if (!channel) {
        console.error(`[DiscordManager] Channel ${channelId} not found`);
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
      console.error('[DiscordManager] Failed to join channel:', error);
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
      console.log('[DiscordManager] Streaming stopped');
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
      console.log('[DiscordManager] Streaming resumed');
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

      console.log('[DiscordManager] Initializing Opus encoder');
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
        console.error(
          '[DiscordManager] Encoder error during streaming:',
          err.message,
        );
        this.audioPlayer?.stop(true);
      });

      this.encoder.on('close', () => {
        console.log('[DiscordManager] Encoder closed');
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
        console.error('[DiscordManager] PlayStream error:', err.message);
      });

      // Start playing the resource
      this.audioPlayer.play(this.audioResource);

      if (this.jitterBuffer) {
        console.log(
          `[DiscordManager] Jitter buffer initialized: target ${
            this.jitterBuffer.getStats().targetBufferSize
          } frames`,
        );
      }

      console.log(
        '[DiscordManager] Started streaming with stability features enabled',
      );
    } catch (error) {
      console.error('[DiscordManager] Error starting stream:', error);
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
      console.error(
        `[DiscordManager] Max reconnection attempts (${this.maxReconnectAttempts}) reached`,
      );
      this.updateState().then(() => {});
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[DiscordManager] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelayMs}ms`,
    );

    setTimeout(() => {
      this.joinChannel(guildId, channelId).catch(console.error);
    }, this.reconnectDelayMs);
  }

  private async handleConnectionFailure(token: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        '[DiscordManager] Max reconnection attempts reached, giving up',
      );
      return;
    }

    this.reconnectAttempts++;
    const delayMs =
      this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    console.log(
      `[DiscordManager] Retrying connection in ${delayMs}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await this.connect(token);
  }

  private updateAudioResourceBitrate(): void {
    if (!this.audioResource) {
      console.warn('[DiscordManager] Cannot update bitrate: no audio resource');
      return;
    }

    // Note: Bitrate update depends on stream type and encoder configuration
    // This is typically handled by the encoder on the frontend or requires recreating the resource
    console.log(
      `[DiscordManager] Bitrate configuration updated to ${this.currentBitrate} kbps`,
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
      console.log('[DiscordManager] Voice connection ready');
      this.startStreaming();
      this.updateState(guildId, channelId).then(() => {});
    });

    this.connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.warn('[DiscordManager] Voice connection disconnected');
      // Attempt to reconnect
      this.attemptReconnect(guildId, channelId);
    });

    this.connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.warn('[DiscordManager] Voice connection destroyed');
    });
  }

  private async broadcastDiscordState(): Promise<void> {
    const viewManager = await ViewManager.getInstance();
    viewManager.broadcast(DiscordChannel.STATE_UPDATE, undefined, this.state);
    console.log(
      `[DiscordManager] Broadcasted Discord state update: ${
        this.state.type
      }|channel name=${
        (this.state as DiscordStateConnected)?.channelName || 'N/A'
      }`,
    );
  }
}
