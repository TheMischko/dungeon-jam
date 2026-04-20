import {
  DiscordState,
  DiscordTokenData,
  GuildWithChannels,
} from '@shared/models/discord.model';

export type DiscordWindow = Window &
  typeof globalThis & {
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
      joinChannel: (guildId: string, channelId: string) => Promise<void>;
      disconnect: () => Promise<void>;
      onStateUpdate: (
        callback: (state: DiscordState) => void | Promise<void>
      ) => void;
      connectToken: (tokenId: string) => Promise<boolean>;
      disconnectToken: (tokenId: string) => Promise<boolean>;
      getConnectedTokens: () => Promise<DiscordTokenData[]>;
    };
  };
