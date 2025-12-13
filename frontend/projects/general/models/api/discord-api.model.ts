import { GuildWithChannels, DiscordState } from '@shared/models/discord.model';

export type DiscordWindow = Window &
  typeof globalThis & {
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
      joinChannel: (guildId: string, channelId: string) => Promise<void>;
      disconnect: () => Promise<void>;
      onStateUpdate: (
        callback: (state: DiscordState) => void | Promise<void>,
      ) => void;
    };
  };
