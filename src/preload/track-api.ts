import { PlaylistTracksQuery, Track } from '@shared/models/track.model';
import { ipcRenderer } from 'electron';
import { TrackChannel } from '@shared/models/channels.model';

const getAllTracks = async (): Promise<Track[]> => {
  return await ipcRenderer.invoke(TrackChannel.GET_ALL);
};

const getTrackById = async (id: string): Promise<Track | null> => {
  return await ipcRenderer.invoke(TrackChannel.GET_BY_ID, id);
};

const getTracksByPlaylist = async (
  query: PlaylistTracksQuery,
): Promise<Track[]> => {
  return await ipcRenderer.invoke(TrackChannel.GET_PLAYLIST_TRACKS, query);
};

const createTrack = async (
  name: string,
  url: string,
  duration: number,
  author?: string,
  tags?: string[],
): Promise<Track> => {
  return await ipcRenderer.invoke(
    TrackChannel.INSERT,
    name,
    url,
    duration,
    author,
    tags,
  );
};

export default {
  getAllTracks,
  getTrackById,
  createTrack,
  getTracksByPlaylist,
};
