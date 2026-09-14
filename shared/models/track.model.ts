import { QueryRequest } from '@shared/models/request.model';

export interface Track {
  id: string;
  name: string;
  url: string;
  author?: string;
  duration: number;
  tags?: string[];
}

export interface AudioTrack {
  title: string;
  fullPath: string;
  author?: string;
  length: number;
  tags?: string[];
}

export interface FileBase64 {
  base64: string;
  mimeType: string;
}

export interface StoredPlayback {
  volume: number;
  shuffle: boolean;
  repeat: RepeatState;
}

export interface StoredTransitionSettings {
  crossFadeDuration: number;
  fadeInDuration: number;
}

export type PlaybackSettings = StoredPlayback & StoredTransitionSettings;

export interface PlaylistTracksQuery extends QueryRequest {
  playlistId: string;
  includeChildren?: boolean;
}

export interface TaggedTracksQuery extends QueryRequest {
  tagId: string;
}

export enum RepeatState {
  NONE,
  SINGLE,
  ALL,
}
