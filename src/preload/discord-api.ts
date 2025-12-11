import { ipcRenderer } from 'electron';
import { DiscordChannel } from '@shared/models/channels.model';
import { GuildWithChannels } from '@shared/models/discord.model';

const getChannels = async (): Promise<GuildWithChannels[]> => {
  return await ipcRenderer.invoke(DiscordChannel.GET_CHANNELS);
};

const DiscordApi = {
  getChannels,
};

export default DiscordApi;
