import { StoredPlayback, Track } from '@shared/models/track.model';

export enum RepeatState {
  NONE,
  SINGLE,
  ALL,
}

export type PlaybackState = {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  repeat: RepeatState;
  shuffle: boolean;
  playlistId?: string;
} & StoredPlayback;

export type PlaybackTrackPosition = {
  position: number;
  duration: number;
};

export const initialPlaybackState: PlaybackState = {
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 1,
  shuffle: false,
  repeat: RepeatState.NONE,
};

export enum PlayingTrackState {
  NONE = 'NONE',
  LOADED = 'LOADED',
  PLAYING = 'PLAYING',
  ENDING_SOON = 'ENDING_SOON',
  ENDED = 'ENDED',
}
