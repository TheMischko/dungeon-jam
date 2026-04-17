import { StoredPlayback, Track } from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';
import { DiscordTokenData } from '@shared/models/discord.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: initPlaylists(),
    playback: initPlayback(),
    tags: initTags(),
    discordTokens: initDiscordTokens(),
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
  return [];
}

function initTags(): TagData[] {
  return [];
}

function initDiscordTokens(): DiscordTokenData[] {
  return [];
}
