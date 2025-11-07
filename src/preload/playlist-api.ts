import { QueryRequest } from '@shared/models/request.model';
import { ipcRenderer } from 'electron';
import { PlaylistChannel } from '@shared/models/channels.model';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';

const getAllPlaylists = async (options: QueryRequest): Promise<Playlist[]> => {
  return await ipcRenderer.invoke(PlaylistChannel.GET_ALL, options);
};

const getPlaylistById = async (playlistId: string): Promise<Playlist> => {
  return await ipcRenderer.invoke(PlaylistChannel.GET_BY_ID, playlistId);
};

const insertPlaylist = async (data: PlaylistInsertQuery): Promise<Playlist> => {
  return await ipcRenderer.invoke(PlaylistChannel.INSERT, data);
};

const addTracksToPlaylists = async (
  data: PlaylistAddTracksData,
): Promise<Map<string, Playlist>> => {
  return await ipcRenderer.invoke(PlaylistChannel.ADD_TRACKS, data);
};

const updatePlaylist = async (
  query: PlaylistUpdateQuery,
): Promise<Playlist> => {
  return await ipcRenderer.invoke(PlaylistChannel.UPDATE, query);
};
export default {
  getAllPlaylists,
  getPlaylistById,
  insertPlaylist,
  addTracksToPlaylists,
  updatePlaylist,
};
