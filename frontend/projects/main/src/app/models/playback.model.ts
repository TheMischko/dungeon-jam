import { StoredPlayback, Track } from '@shared/models/track.model';

export enum RepeatState {
  NONE,
  SINGLE,
  ALL,
}

export type QueueItem = {
  track: Track;
  isInjected: boolean;
};

export type PlaybackState = {
  currentTrack: Track | null;
  currentTrackIsInjected: boolean;
  queue: QueueItem[];
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
  currentTrackIsInjected: false,
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
