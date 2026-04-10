import { PlaylistTracksQuery, TaggedTracksQuery, Track } from '@shared/models/track.model';
import { ipcRenderer } from 'electron';
import { TrackChannel } from '@shared/models/channels.model';
import { QueryRequest } from '@shared/models/request.model';

const getAllTracks = async (query?: QueryRequest): Promise<Track[]> => {
  return await ipcRenderer.invoke(TrackChannel.GET_ALL, query);
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

const updateTrack = async (track: Track): Promise<Track> => {
  return await ipcRenderer.invoke(TrackChannel.UPDATE, track);
};

const deleteTrack = async (id: string): Promise<boolean> => {
  return await ipcRenderer.invoke(TrackChannel.DELETE, id);
};

const getTaggedTracks = async (query: TaggedTracksQuery): Promise<Track[]> => {
  return await ipcRenderer.invoke(TrackChannel.GET_TAGGED_TRACKS, query);
};

export default {
  getAllTracks,
  getTrackById,
  createTrack,
  getTracksByPlaylist,
  updateTrack,
  deleteTrack,
  getTaggedTracks,
};
