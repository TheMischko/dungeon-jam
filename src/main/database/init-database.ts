import { StoredPlayback, Track } from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';
import { playlistsMock } from './playlists.mock';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: initPlaylists(),
    playback: initPlayback(),
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;

function initTracks(): Track[] {
  return [];
}

function initPlayback(): StoredPlayback {
  return {
    volume: 1,
  };
}

function initPlaylists(): Playlist[] {
  return playlistsMock;
}
