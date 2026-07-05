export enum GeneralChannels {
  GET_OS = 'GET_OS',
  REDIRECT = 'redirect',
  APP_READY = 'app/ready',
  CLOSE_APP = 'app/close',
  MINIMIZE_APP = 'app/minimize',
  MAXIMIZE_APP = 'app/maximize',
  UNMAXIMIZE_APP = 'app/unmaximize',
  APP_MINIMIZED = 'app/minimized',
  APP_MAXIMIZED = 'app/maximized',
}

export enum TrackChannel {
  GET_ALL = 'tracks/get-all',
  GET_BY_ID = 'tracks/get-by-id',
  INSERT = 'tracks/add',
  UPDATE = 'tracks/update',
  DELETE = 'tracks/delete',
  GET_PLAYLIST_TRACKS = 'tracks/get-playlist-tracks',
  GET_TAGGED_TRACKS = 'tracks/get-tagged-tracks',
  PLAYLIST_DISCOVER = 'tracks/playlist-discover',
}

export enum AudioFileChannel {
  FETCH_DATA = 'audio/fetch-data',
  UPLOAD = 'audio/upload',
  LOAD_FILE = 'audio/load-file',
  OPEN_AUDIO_FILES_PICKER = 'audio/open-audio-files',
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
  CHANGE_ORDER = 'playlists/change-order',
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
  GET_TOKEN_CHANNELS = 'discord/get-token-channels',
}

export enum DiscordTokenChannel {
  CREATE = 'discord-tokens/create',
  GET_ALL = 'discord-tokens/get-all',
  UPDATE = 'discord-tokens/update',
  DELETE = 'discord-tokens/delete',
}

export enum SoundEffectChannel {
  CREATE = 'sound-effects/create',
  UPDATE = 'sound-effects/update',
  DELETE = 'sound-effects/delete',
  GET_BY_ID = 'sound-effects/get-by-id',
  GET_ALL = 'sound-effects/get-all',
  CHANGE_ORDER = 'sound-effect/change-order',
}

export enum ImageChannel {
  OPEN_PICKER = 'image/open-picker',
  PROCESS_AND_SAVE = 'image/process-and-save',
  DELETE = 'image/delete',
  FETCH_IMAGE = 'image/fetch',
}

export enum SceneChannel {
  GET_ALL = 'scene/get-all',
  GET_BY_ID = 'scene/get-by-id',
  INSERT = 'scene/insert',
  UPDATE = 'scene/update',
  DELETE = 'scene/delete',
  CHANGE_ORDER = 'scene/change-order',
}

export enum SessionChannel {
  GET_ALL = 'session/get-all',
  GET_BY_ID = 'session/get-by-id',
  INSERT = 'session/insert',
  UPDATE = 'session/update',
  DELETE = 'session/delete',
  GET_SESSION_SCENES = 'session/get-scenes',
}

export enum NotificationChannel {
  PUSH = 'notification/push',
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
  | DiscordTokenChannel
  | SoundEffectChannel
  | ImageChannel
  | SceneChannel
  | SessionChannel
  | NotificationChannel;
