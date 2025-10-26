import { QueryRequest } from '@shared/models/request.model';
import { ipcRenderer } from 'electron';
import { PlaylistChannel } from '@shared/models/channels.model';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';

const getAllPlaylists = async (options: QueryRequest): Promise<Playlist[]> => {
  return await ipcRenderer.invoke(PlaylistChannel.GET_ALL, options);
};

const insertPlaylist = async (data: PlaylistInsertQuery): Promise<Playlist> => {
  return await ipcRenderer.invoke(PlaylistChannel.INSERT, data);
};

export default {
  getAllPlaylists,
  insertPlaylist,
};
