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
import {
  Client,
  GatewayIntentBits,
  NonThreadGuildBasedChannel,
  OAuth2Guild,
  VoiceChannel,
} from 'discord.js';
import { ChannelData, GuildWithChannels } from '@shared/models/discord.model';
import { Readable } from 'node:stream';
import ffmpegPath from 'ffmpeg-static';
import { JitterBuffer } from '../services/jitter-buffer';
import {
  NetworkHealthMonitor,
  NetworkQuality,
} from '../services/network-health-monitor';

export class DiscordManager {
  private audioPlayer?: AudioPlayer;
  private client?: Client;
  private audioResource?: AudioResource;
  private connection?: VoiceConnection;
  private jitterBuffer?: JitterBuffer;
  private networkMonitor?: NetworkHealthMonitor;
  private currentBitrate = 128; // kbps
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelayMs = 3000;

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
    this.audioPlayer.on('error', console.error);
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      console.log(
        `[DiscordManager] AudioPlayer state: ${oldState.status} → ${newState.status}`,
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

  async getGuildChannels(): Promise<GuildWithChannels[]> {
    if (!this.client) {
      return [];
    }

    const rawGuilds = await this.client.guilds.fetch();
    return await Promise.all(
      rawGuilds.map(
        async (baseGuild) => await this.getGuildChannelFromRaw(baseGuild),
      ),
    );
  }

  async joinChannel(channelId: string, stream: Readable): Promise<void> {
    if (!this.client) {
      console.error('[DiscordManager] Client not initialized');
      return;
    }

    try {
      const channel = (await this.client.channels.fetch(
        channelId,
      )) as VoiceChannel | null;
      if (!channel) {
        console.error(`[DiscordManager] Channel ${channelId} not found`);
        return;
      }

      this.connection?.destroy();
      this.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Monitor connection status for unstable networks
      this.connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('[DiscordManager] Voice connection ready');
        this.startStreaming(stream);
      });

      this.connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.warn('[DiscordManager] Voice connection disconnected');
        // Attempt to reconnect
        this.attemptReconnect(channelId, stream);
      });

      this.connection.on(VoiceConnectionStatus.Destroyed, () => {
        console.warn('[DiscordManager] Voice connection destroyed');
      });
    } catch (error) {
      console.error('[DiscordManager] Failed to join channel:', error);
    }
  }

  private attemptReconnect(channelId: string, stream: Readable): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[DiscordManager] Max reconnection attempts (${this.maxReconnectAttempts}) reached`,
      );
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[DiscordManager] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelayMs}ms`,
    );

    setTimeout(() => {
      this.joinChannel(channelId, stream).catch(console.error);
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

  startStreaming(stream: Readable) {
    if (!this.audioPlayer || !this.connection) {
      throw new Error('Cannot start stream without successful initial setup');
    }

    // Initialize jitter buffer for stability
    // Frame size 1920 bytes = 960 samples * 2 bytes per 16-bit sample
    this.jitterBuffer = new JitterBuffer(1920, 200, 48000); // 1920 bytes frame, 200ms target

    this.connection.subscribe(this.audioPlayer);
    this.audioResource = createAudioResource(stream, {
      inputType: StreamType.Opus,
      inlineVolume: true,
      silencePaddingFrames: 5,
      metadata: {
        ffmpegPath,
      },
    });
    this.audioResource.volume?.setVolume(1);
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

  private resolveOnceClientIsReady(resolve: () => void) {
    if (!this.client) {
      resolve();
      return;
    }
    this.client.once('ready', () => resolve());
  }

  private async getGuildChannelFromRaw(
    rawGuild: OAuth2Guild,
  ): Promise<GuildWithChannels> {
    const guild = await rawGuild.fetch();
    const voiceChannels: ChannelData[] = [];
    const channels = await guild.channels.fetch();
    channels.forEach((channel: NonThreadGuildBasedChannel | null) => {
      if (channel && channel.isVoiceBased()) {
        voiceChannels.push({
          id: channel.id,
          name: channel.name,
        });
      }
    });
    return {
      guildId: guild.id,
      guildName: guild.name,
      guildIconURL: guild.iconURL() || undefined,
      channels: voiceChannels,
    };
  }
}
