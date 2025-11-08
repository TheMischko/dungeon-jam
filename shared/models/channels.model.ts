export enum GeneralChannels {
  GET_OS = 'GET_OS',
  REDIRECT = 'redirect',
}

export enum TrackChannel {
  GET_ALL = 'tracks/get-all',
  GET_BY_ID = 'tracks/get-by-id',
  INSERT = 'tracks/add',
  GET_PLAYLIST_TRACKS = 'tracks/get-playlist-tracks',
}

export enum AudioFileChannel {
  FETCH_DATA = 'audio/fetch-data',
  UPLOAD = 'audio/upload',
  LOAD_FILE = 'audio/load-file',
}

export enum PlaybackChannel {
  LOAD = 'playback/load',
  UPDATE = 'playback/update',
}

export enum PlaylistChannel {
  GET_ALL = 'playlists/get-all',
  GET_BY_ID = 'playlists/get',
  INSERT = 'playlists/insert',
  ADD_TRACKS = 'playlists/add-tracks',
  UPDATE = 'playlists/update',
}

export enum TagChannel {
  GET_ALL = 'tags/get-all',
  GET_SUBSET = 'tags/get-subset',
  SUGGESTION = 'tags/suggestion',
  INSERT = 'tags/insert',
  DELETE_ONE = 'tags/delete-one',
  CLEAR_ORPHANS = 'tags/clear-orphans',
}

export type AppChannel =
  | GeneralChannels
  | TrackChannel
  | AudioFileChannel
  | PlaybackChannel
  | PlaylistChannel
  | TagChannel;
