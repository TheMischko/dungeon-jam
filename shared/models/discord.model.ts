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

export interface JoinChannelRequest {
  guildId: string;
  channelId: string;
}

export type DiscordState = DiscordStateNone | DiscordStateConnected;

export type DiscordStateNone = {
  type: DiscordStateType.NONE;
};

export type DiscordStateConnected = {
  type: DiscordStateType.CONNECTED;
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
};

export enum DiscordStateType {
  NONE = 'NONE',
  CONNECTED = 'CONNECTED',
}

export type DiscordTokenData = {
  apiKey: string;
  name: string;
}