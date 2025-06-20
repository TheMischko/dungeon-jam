import { Track } from '@shared/models/track.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: [],
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;

function initTracks(): Track[] {
  return [];
}
