import { DiscordTokenData } from '@shared/models/discord.model';

export type DiscordTokenApiWindow = Window &
  typeof globalThis & {
    DISCORD_TOKEN_API: {
      createToken: (data: DiscordTokenData) => Promise<DiscordTokenData>;
      getAllTokens: () => Promise<DiscordTokenData[]>;
      updateToken: (data: DiscordTokenData) => Promise<DiscordTokenData>;
      deleteToken: (apiKey: string) => Promise<boolean>;
    };
  };
