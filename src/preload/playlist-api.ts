import { QueryRequest } from '@shared/models/request.model';
import { ipcRenderer } from 'electron';
import { PlaylistChannel } from '@shared/models/channels.model';
import { Playlist } from '@shared/models/playlist.model';

const getAllPlaylists = async (options: QueryRequest): Promise<Playlist[]> => {
  return await ipcRenderer.invoke(PlaylistChannel.GET_ALL, options);
};

export default {
  getAllPlaylists,
};
