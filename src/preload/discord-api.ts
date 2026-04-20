import { ipcRenderer } from 'electron';
import { DiscordChannel } from '@shared/models/channels.model';
import {
  GuildWithChannels,
  JoinChannelRequest,
  DiscordState,
  DiscordTokenData,
} from '@shared/models/discord.model';

const getChannels = async (): Promise<GuildWithChannels[]> => {
  return await ipcRenderer.invoke(DiscordChannel.GET_CHANNELS);
};

const joinChannel = async (
  guildId: string,
  channelId: string,
): Promise<void> => {
  return await ipcRenderer.invoke(DiscordChannel.JOIN_CHANNEL, {
    guildId,
    channelId,
  } as JoinChannelRequest);
};

const disconnect = async (): Promise<void> => {
  return await ipcRenderer.invoke(DiscordChannel.DISCONNECT);
};

const onStateUpdate = (
  callback: (state: DiscordState) => void | Promise<void>,
): void => {
  ipcRenderer.on(DiscordChannel.STATE_UPDATE, (_, state: DiscordState) => {
    callback(state);
  });
};

const connectToken = async (tokenId: string): Promise<boolean> => {
  return await ipcRenderer.invoke(DiscordChannel.CONNECT_TOKEN, tokenId);
};

const getConnectedTokens = async (): Promise<DiscordTokenData[]> => {
  return await ipcRenderer.invoke(DiscordChannel.GET_CONNECTED_TOKENS);
};

const DiscordApi = {
  getChannels,
  joinChannel,
  disconnect,
  onStateUpdate,
  connectToken,
  getConnectedTokens,
};

export default DiscordApi;
