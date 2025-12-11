import { GuildWithChannels } from '@shared/models/discord.model';

export type DiscordWindow = Window &
  typeof globalThis & {
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
    };
  };
