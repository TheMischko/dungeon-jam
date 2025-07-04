import {StoredPlayback, Track} from '@shared/models/track.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: [],
    playback: initPlayback()
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;

function initTracks(): Track[] {
  return [];
}

function initPlayback(): StoredPlayback {
  return {
    volume: 1
  }
}
