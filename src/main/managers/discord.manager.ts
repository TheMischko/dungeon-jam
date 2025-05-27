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

export class DiscordManager {
  private audioPlayer?: AudioPlayer;
  private client?: Client;
  private audioResource?: AudioResource;
  private connection?: VoiceConnection;

  createAudioPlayer(): void {
    if (this.audioPlayer) {
      this.audioPlayer.stop(true);
      this.audioPlayer = undefined;
    }

    this.audioPlayer = new AudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
        maxMissedFrames: 3000,
      },
    });
    this.audioPlayer.on('error', console.error);
  }

  async connect(token: string): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = undefined;
    }

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    const readyPromise = new Promise<void>((resolve) => {
      this.resolveOnceClientIsReady(resolve);
    });
    await this.client.login(token);
    await readyPromise;
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
      return;
    }
    const channel = (await this.client.channels.fetch(
      channelId,
    )) as VoiceChannel | null;
    if (!channel) {
      return;
    }

    this.connection?.destroy();
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    this.connection.on(VoiceConnectionStatus.Ready, () => {
      this.startStreaming(stream);
    });
  }

  startStreaming(stream: Readable) {
    if (!this.audioPlayer || !this.connection) {
      throw new Error('Cannot start stream without successful initial setup');
    }
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
    console.log('started streaming');
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
