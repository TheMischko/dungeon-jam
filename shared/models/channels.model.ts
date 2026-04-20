export enum GeneralChannels {
  GET_OS = 'GET_OS',
  REDIRECT = 'redirect',
  APP_READY = 'app/ready',
}

export enum TrackChannel {
  GET_ALL = 'tracks/get-all',
  GET_BY_ID = 'tracks/get-by-id',
  INSERT = 'tracks/add',
  UPDATE = 'tracks/update',
  DELETE = 'tracks/delete',
  GET_PLAYLIST_TRACKS = 'tracks/get-playlist-tracks',
  GET_TAGGED_TRACKS = 'tracks/get-tagged-tracks',
}

export enum AudioFileChannel {
  FETCH_DATA = 'audio/fetch-data',
  UPLOAD = 'audio/upload',
  LOAD_FILE = 'audio/load-file',
}

export enum PlaybackChannel {
  LOAD = 'playback/load',
  UPDATE = 'playback/update',
  CAPTURE_SETTINGS = 'playback/capture-settings',
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
  GET_TRACKS_COUNT = 'tags/get-tracks-count',
  GET_DETAILS = 'tags/get-details',
  SUGGESTION = 'tags/suggestion',
  INSERT = 'tags/insert',
  DELETE_ONE = 'tags/delete-one',
  CLEAR_ORPHANS = 'tags/clear-orphans',
  UPDATE = 'tags/update',
}

export enum CaptureChannel {
  SETTINGS = 'capture/settings',
}

export enum DiscordChannel {
  GET_CHANNELS = 'discord/get-channels',
  JOIN_CHANNEL = 'discord/join-channel',
  DISCONNECT = 'discord/disconnect',
  STATE_UPDATE = 'discord/state-update',
  CONNECT_TOKEN = 'discord/connect-token',
  DISCONNECT_TOKEN = 'discord/disconnect-token',
  GET_CONNECTED_TOKENS = 'discord/get-connected-tokens',
  ACTIVE_TOKENS_UPDATE = 'discord/active-token-update',
}

export enum DiscordTokenChannel {
  CREATE = 'discord-tokens/create',
  GET_ALL = 'discord-tokens/get-all',
  UPDATE = 'discord-tokens/update',
  DELETE = 'discord-tokens/delete',
}

export type AppChannel =
  | GeneralChannels
  | TrackChannel
  | AudioFileChannel
  | PlaybackChannel
  | PlaylistChannel
  | TagChannel
  | CaptureChannel
  | DiscordChannel
  | DiscordTokenChannel;
