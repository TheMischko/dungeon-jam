import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';

export type DiscordTokenApiWindow = Window &
  typeof globalThis & {
    DISCORD_TOKEN_API: {
      createToken: (data: DiscordTokenData) => Promise<DiscordTokenData>;
      getAllTokens: () => Promise<DiscordTokenData[]>;
      updateToken: (id: string, newData: DiscordTokenUpdateData) => Promise<DiscordTokenData>;
      deleteToken: (id: string) => Promise<boolean>;
    };
  };
