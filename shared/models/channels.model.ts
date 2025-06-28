export enum GeneralChannels {
  GET_OS = 'GET_OS',
  REDIRECT = 'redirect',
}

export enum TrackChannel {
  GET_ALL = 'tracks/get-all',
  GET_BY_ID = 'tracks/get-by-id',
  INSERT = 'tracks/add',
}

export enum AudioFileChannel {
  FETCH_DATA = 'audio/fetch-data',
  UPLOAD = 'audio/upload',
  LOAD_FILE = 'audio/load-file',
}

export type AppChannel = GeneralChannels | TrackChannel | AudioFileChannel;
