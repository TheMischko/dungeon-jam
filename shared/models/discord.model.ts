export interface GuildWithChannels {
  guildId: string;
  guildName: string;
  guildIconURL?: string;
  channels: ChannelData[];
}

export interface ChannelData {
  id: string;
  name: string;
}
