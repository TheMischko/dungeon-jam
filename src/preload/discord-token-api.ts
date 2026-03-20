import { ipcRenderer } from 'electron';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';

const createToken = async (data: DiscordTokenUpdateData): Promise<DiscordTokenData> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.CREATE, data);
};

const getAllTokens = async (): Promise<DiscordTokenData[]> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.GET_ALL);
};

const updateToken = async (id: string, newData: DiscordTokenUpdateData): Promise<DiscordTokenData> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.UPDATE, { id, newData });
};

const deleteToken = async (id: string): Promise<boolean> => {
  return await ipcRenderer.invoke(DiscordTokenChannel.DELETE, id);
};

const DiscordTokenApi = {
  createToken,
  getAllTokens,
  updateToken,
  deleteToken,
};

export default DiscordTokenApi;
