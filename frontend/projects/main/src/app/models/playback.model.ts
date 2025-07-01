import { Track } from '@shared/models/track.model';

export interface PlaybackState {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
}

export const initialPlaybackState: PlaybackState = {
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  position: 0,
  duration: 0,
};

export enum PlayingTrackState {
  NONE = 'NONE',
  LOADED = 'LOADED',
  PLAYING = 'PLAYING',
  ENDING_SOON = 'ENDING_SOON',
  ENDED = 'ENDED'
}
