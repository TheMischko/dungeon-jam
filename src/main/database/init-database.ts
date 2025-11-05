import { StoredPlayback, Track } from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';
import { playlistsMock } from './playlists.mock';
import { TagData } from '@shared/models/tag.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: initPlaylists(),
    playback: initPlayback(),
    tags: initTags(),
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;
export type DatabaseTable = keyof DatabaseSchema;

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

function initTags(): TagData[] {
  return [];
}
