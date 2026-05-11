import { RepeatState, StoredPlayback, Track } from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';
import { DiscordTokenData } from '@shared/models/discord.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { DisplayOrder } from '@shared/models/display-order.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: initPlaylists(),
    playback: initPlayback(),
    tags: initTags(),
    discordTokens: initDiscordTokens(),
    soundEffects: initSoundEffects(),
    displayOrder: initDisplayOrder(),
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
    shuffle: false,
    repeat: RepeatState.NONE,
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

function initSoundEffects(): SoundEffect[] {
  return [];
}

function initDisplayOrder(): DisplayOrder[] {
  return [];
}
