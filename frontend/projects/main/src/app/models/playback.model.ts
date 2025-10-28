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
  position: number;
  duration: number;
  repeat: RepeatState;
  playlistId?: string;
} & StoredPlayback;

export const initialPlaybackState: PlaybackState = {
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,
  repeat: RepeatState.NONE,
};

export enum PlayingTrackState {
  NONE = 'NONE',
  LOADED = 'LOADED',
  PLAYING = 'PLAYING',
  ENDING_SOON = 'ENDING_SOON',
  ENDED = 'ENDED',
}
