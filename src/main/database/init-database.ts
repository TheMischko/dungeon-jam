import {
  PlaybackSettings,
  RepeatState,
  Track,
} from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';
import { DiscordTokenData } from '@shared/models/discord.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { DisplayOrder } from '@shared/models/display-order.model';
import { Scene } from '@shared/models/scene.model';
import { SessionData } from '@shared/models/session.model';
import { UpdatePreferences } from '@shared/models/application.model';

export function initDatabase() {
  return {
    tracks: initTracks(),
    playlists: initPlaylists(),
    playback: initPlayback(),
    tags: initTags(),
    discordTokens: initDiscordTokens(),
    soundEffects: initSoundEffects(),
    displayOrder: initDisplayOrder(),
    scenes: initScenes(),
    sessions: initSessions(),
    updatePreferences: initUpdatePreferences(),
  };
}
export type DatabaseSchema = ReturnType<typeof initDatabase>;
export type DatabaseTable = keyof DatabaseSchema;

function initTracks(): Track[] {
  return [];
}

function initPlayback(): PlaybackSettings {
  return {
    volume: 1,
    shuffle: false,
    repeat: RepeatState.NONE,
    crossFadeDuration: 1,
    fadeInDuration: 1,
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

function initScenes(): Scene[] {
  return [];
}

function initSessions(): SessionData[] {
  return [];
}

function initUpdatePreferences(): UpdatePreferences {
  return {};
}
