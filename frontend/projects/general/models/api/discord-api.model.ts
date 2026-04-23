import {
  DiscordState,
  DiscordTokenActiveUpdate,
  DiscordTokenData,
  GuildWithChannels,
} from '@shared/models/discord.model';

export type DiscordWindow = Window &
  typeof globalThis & {
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
      joinChannel: (guildId: string, channelId: string, tokenId: string) => Promise<void>;
      disconnect: () => Promise<void>;
      onStateUpdate: (
        callback: (state: DiscordState) => void | Promise<void>
      ) => void;
      onActiveTokensUpdate: (
        callback: (update: DiscordTokenActiveUpdate) => void | Promise<void>
      ) => void;
      connectToken: (tokenId: string) => Promise<boolean>;
      disconnectToken: (tokenId: string) => Promise<boolean>;
      getConnectedTokens: () => Promise<DiscordTokenData[]>;
      getTokenChannels: (tokenId: string) => Promise<GuildWithChannels[]>;
    };
  };
