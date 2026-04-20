import { ipcRenderer } from 'electron';
import { DiscordChannel } from '@shared/models/channels.model';
import {
  GuildWithChannels,
  JoinChannelRequest,
  DiscordState,
  DiscordTokenData,
  DiscordTokenActiveUpdate,
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

const onActiveTokensUpdate = (
  callback: (update: DiscordTokenActiveUpdate) => void | Promise<void>,
): void => {
  ipcRenderer.on(DiscordChannel.ACTIVE_TOKENS_UPDATE, (_, update: DiscordTokenActiveUpdate) => {
    callback(update);
  });
};

const connectToken = async (tokenId: string): Promise<boolean> => {
  return await ipcRenderer.invoke(DiscordChannel.CONNECT_TOKEN, tokenId);
};

const disconnectToken = async (tokenId: string): Promise<boolean> => {
  return await ipcRenderer.invoke(DiscordChannel.DISCONNECT_TOKEN, tokenId);
};

const getConnectedTokens = async (): Promise<DiscordTokenData[]> => {
  return await ipcRenderer.invoke(DiscordChannel.GET_CONNECTED_TOKENS);
};

const DiscordApi = {
  getChannels,
  joinChannel,
  disconnect,
  onStateUpdate,
  onActiveTokensUpdate,
  connectToken,
  disconnectToken,
  getConnectedTokens,
};

export default DiscordApi;
