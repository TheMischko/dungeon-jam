import { ipcRenderer } from 'electron';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DiscordTokenData } from '@shared/models/discord.model';

const createToken = async (data: DiscordTokenData): Promise<DiscordTokenData> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.CREATE, data);
};

const getAllTokens = async (): Promise<DiscordTokenData[]> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.GET_ALL);
};

const updateToken = async (data: DiscordTokenData): Promise<DiscordTokenData> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.UPDATE, data);
};

const deleteToken = async (apiKey: string): Promise<boolean> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.DELETE, apiKey);
};

const DiscordTokenApi = {
  createToken,
  getAllTokens,
  updateToken,
  deleteToken,
};

export default DiscordTokenApi;
