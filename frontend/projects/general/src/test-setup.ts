import { RedirectRequest } from '@shared/models/redirect.model';
import { OperatingSystem } from '@shared/models/application.model';
import {
  DiscordState,
  DiscordTokenActiveUpdate,
  DiscordTokenData,
  DiscordTokenUpdateData,
  GuildWithChannels,
} from '@shared/models/discord.model';
import { AppNotification } from '@shared/models/notification.model';
import {
  AudioTrack,
  FileBase64,
  PlaylistTracksQuery,
  RepeatState,
  StoredPlayback,
  StoredTransitionSettings,
  TaggedTracksQuery,
  Track,
} from '@shared/models/track.model';
import {
  PlaylistDiscoverBatchRequest,
  QueryOptions,
  QueryRequest,
} from '@shared/models/request.model';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistReorderQuery,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';
import { Tag, TagData, TagDetail } from '@shared/models/tag.model';
import {
  SoundEffect,
  SoundEffectCreateData,
  SoundEffectReorderQuery,
  SoundEffectUpdateData,
} from '@shared/models/sound-effect.model';
import {
  Scene,
  SceneInsertQuery,
  SceneUpdateQuery,
} from '@shared/models/scene.model';
import {
  SessionData,
  SessionInsertQuery,
  SessionScenesQuery,
  SessionUpdateQuery,
} from '@shared/models/session.model';

/**
 * Ambient `window.*_API` typings mirroring the contract exposed by the Electron
 * preload scripts (see `src/preload.ts` and `src/preload/*.ts`). These are only
 * available in the Electron renderer at runtime, so unit tests need stand-in
 * implementations to avoid `undefined` access errors when services/components
 * touch a `window.*_API` in their constructors.
 */
declare global {
  interface Window {
    GENERAL_API: {
      triggerRedirect: (request: RedirectRequest) => void;
      registerRedirect: (
        callback: (request: RedirectRequest) => void | Promise<void>,
      ) => void;
      onApplicationReady: (callback: () => void | Promise<void>) => void;
      closeApp: () => Promise<void>;
      minimizeApp: () => Promise<void>;
      maximizeApp: () => Promise<void>;
      unmaximizeApp: () => Promise<void>;
      onAppMinimized: (
        callback: (isMinimized: boolean) => void | Promise<void>,
      ) => void;
      onAppMaximized: (
        callback: (isMaximized: boolean) => void | Promise<void>,
      ) => void;
      getOS: () => Promise<OperatingSystem>;
      openLogsFolder: () => Promise<void>;
      getAppVersion: () => Promise<string>;
    };
    TRACK_API: {
      getAllTracks: (query?: QueryRequest) => Promise<Track[]>;
      getTrackById: (id: string) => Promise<Track | null>;
      getTracksByPlaylist: (query: PlaylistTracksQuery) => Promise<Track[]>;
      createTrack: (
        name: string,
        url: string,
        duration: number,
        author?: string,
        tags?: string[],
      ) => Promise<Track>;
      updateTrack: (track: Track) => Promise<Track>;
      deleteTrack: (id: string) => Promise<boolean>;
      getTaggedTracks: (query: TaggedTracksQuery) => Promise<Track[]>;
      discoverTracks: (
        query: PlaylistDiscoverBatchRequest,
      ) => Promise<Track[]>;
    };
    AUDIO_FILES_API: {
      fetchAudioData: (paths: string[]) => Promise<AudioTrack[]>;
      registerAudioFileDrop: (
        callback: (tracks: AudioTrack[]) => void,
      ) => void;
      registerFileDrop: (
        accept: string,
        callback: (paths: string[]) => void,
      ) => void;
      uploadTracks: (tracks: AudioTrack[]) => Promise<Track[]>;
      loadFileBase64: (filePath: string) => Promise<FileBase64>;
      openAudioFileDialog: () => Promise<AudioTrack[]>;
    };
    PLAYBACK_API: {
      loadState: () => Promise<StoredPlayback>;
      updateState: (newState: StoredPlayback) => void;
      updateCaptureSettings: (isLocalMuted: boolean) => void;
      loadTransitionSettings: () => Promise<StoredTransitionSettings>;
      updateTransitionSettings: (newState: StoredTransitionSettings) => void;
      onTransitionChanged: (
        callback: (settings: StoredTransitionSettings) => void | Promise<void>
      ) => void;
    };
    PLAYLIST_API: {
      getAllPlaylists: (options: QueryRequest) => Promise<Playlist[]>;
      getPlaylistById: (playlistId: string) => Promise<Playlist>;
      insertPlaylist: (data: PlaylistInsertQuery) => Promise<Playlist>;
      addTracksToPlaylists: (
        data: PlaylistAddTracksData,
      ) => Promise<Map<string, Playlist>>;
      updatePlaylist: (query: PlaylistUpdateQuery) => Promise<Playlist>;
      changePlaylistOrder: (query: PlaylistReorderQuery) => Promise<void>;
    };
    TAG_API: {
      getAllTags: (query: QueryRequest) => Promise<TagData[]>;
      getSubsetOfTags: (
        column: keyof TagData,
        values: [],
      ) => Promise<TagData[]>;
      insertTag: (data: Tag) => Promise<TagData>;
      getTagSuggestion: (titlePart: string) => Promise<TagData[]>;
      deleteTag: (tagId: string) => Promise<void>;
      clearOrphanedTags: () => Promise<number>;
      getTagsTrackCount: () => Promise<Record<string, number>>;
      updateTag: (tag: TagData) => Promise<TagData>;
      getTagDetails: (query?: QueryRequest) => Promise<TagDetail[]>;
    };
    DISCORD_API: {
      getChannels: () => Promise<GuildWithChannels[]>;
      joinChannel: (
        guildId: string,
        channelId: string,
        tokenId: string,
      ) => Promise<void>;
      disconnect: () => Promise<void>;
      onStateUpdate: (
        callback: (state: DiscordState) => void | Promise<void>,
      ) => void;
      onActiveTokensUpdate: (
        callback: (update: DiscordTokenActiveUpdate) => void | Promise<void>,
      ) => void;
      connectToken: (tokenId: string) => Promise<boolean>;
      disconnectToken: (tokenId: string) => Promise<boolean>;
      getConnectedTokens: () => Promise<DiscordTokenData[]>;
      getTokenChannels: (tokenId: string) => Promise<GuildWithChannels[]>;
    };
    DISCORD_TOKEN_API: {
      createToken: (
        data: DiscordTokenUpdateData,
      ) => Promise<DiscordTokenData>;
      getAllTokens: () => Promise<DiscordTokenData[]>;
      updateToken: (
        id: string,
        newData: DiscordTokenUpdateData,
      ) => Promise<DiscordTokenData>;
      deleteToken: (id: string) => Promise<boolean>;
    };
    SOUND_EFFECT_API: {
      getAll: (query: QueryRequest) => Promise<SoundEffect[]>;
      getById: (id: string) => Promise<SoundEffect | null>;
      create: (data: SoundEffectCreateData) => Promise<SoundEffect>;
      update: (data: SoundEffectUpdateData) => Promise<SoundEffect | null>;
      deleteById: (id: string) => Promise<boolean>;
      changeSoundEffectOrder: (
        request: SoundEffectReorderQuery,
      ) => Promise<void>;
    };
    IMAGE_API: {
      fetchImage: (imagePath: string) => Promise<string | null>;
      openPicker: () => Promise<string | null>;
      processAndSave: (
        imagePath: string,
        entityType: string,
      ) => Promise<string>;
      deleteImage: (imagePath: string) => Promise<void>;
    };
    SCENE_API: {
      getAllScenes: (query: QueryOptions) => Promise<Scene[]>;
      getSceneById: (id: string) => Promise<Scene | undefined>;
      insertScene: (data: SceneInsertQuery) => Promise<Scene>;
      updateScene: (data: SceneUpdateQuery) => Promise<Scene>;
      deleteScene: (id: string) => Promise<void>;
      changeScenesOrder: (sceneIds: string[]) => Promise<Scene[]>;
    };
    NOTIFICATION_API: {
      onNotification: (
        callback: (notification: AppNotification) => void,
      ) => void;
    };
    SESSION_API: {
      getAllSessions: (query: QueryOptions) => Promise<SessionData[]>;
      getSessionById: (sessionId: string) => Promise<SessionData | null>;
      insertSession: (
        insertQuery: SessionInsertQuery,
      ) => Promise<SessionData>;
      updateSession: (
        updateQuery: SessionUpdateQuery,
      ) => Promise<SessionData>;
      deleteSession: (sessionId: string) => Promise<void>;
      getSessionScenes: (query: SessionScenesQuery) => Promise<Scene[]>;
      getSessionImages: (
        sessionIds: string[],
      ) => Promise<Record<string, string | null>>;
    };
  }
}

function installWindowApiStubs(): void {
  window.GENERAL_API = {
    triggerRedirect: () => undefined,
    registerRedirect: () => undefined,
    onApplicationReady: () => undefined,
    closeApp: () => Promise.resolve(),
    minimizeApp: () => Promise.resolve(),
    maximizeApp: () => Promise.resolve(),
    unmaximizeApp: () => Promise.resolve(),
    onAppMinimized: () => undefined,
    onAppMaximized: () => undefined,
    getOS: () => Promise.resolve(OperatingSystem.MacOS),
    openLogsFolder: () => Promise.resolve(),
    getAppVersion: () => Promise.resolve('1.0.0'),
  };

  window.TRACK_API = {
    getAllTracks: () => Promise.resolve([]),
    getTrackById: () => Promise.resolve(null),
    getTracksByPlaylist: () => Promise.resolve([]),
    createTrack: (name, url, duration, author, tags) =>
      Promise.resolve({ id: 'stub-track', name, url, duration, author, tags }),
    updateTrack: (track) => Promise.resolve(track),
    deleteTrack: () => Promise.resolve(true),
    getTaggedTracks: () => Promise.resolve([]),
    discoverTracks: () => Promise.resolve([]),
  };

  window.AUDIO_FILES_API = {
    fetchAudioData: () => Promise.resolve([]),
    registerAudioFileDrop: () => undefined,
    registerFileDrop: () => undefined,
    uploadTracks: () => Promise.resolve([]),
    loadFileBase64: () => Promise.resolve({ base64: '', mimeType: '' }),
    openAudioFileDialog: () => Promise.resolve([]),
  };

  window.PLAYBACK_API = {
    loadState: () =>
      Promise.resolve({ volume: 1, shuffle: false, repeat: RepeatState.NONE }),
    updateState: () => undefined,
    updateCaptureSettings: () => undefined,
    loadTransitionSettings: () =>
      Promise.resolve({ fadeInDuration: 1, crossFadeDuration: 1 }),
    updateTransitionSettings: () => undefined,
    onTransitionChanged: () => undefined,
  };

  window.PLAYLIST_API = {
    getAllPlaylists: () => Promise.resolve([]),
    getPlaylistById: (playlistId) =>
      Promise.resolve({
        id: playlistId,
        name: 'stub-playlist',
        tags: [],
        trackIds: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    insertPlaylist: (data) =>
      Promise.resolve({
        id: 'stub-playlist',
        name: data.name,
        tags: [],
        trackIds: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    addTracksToPlaylists: () => Promise.resolve(new Map()),
    updatePlaylist: (query) =>
      Promise.resolve({
        id: query.id,
        name: query.name ?? 'stub-playlist',
        tags: [],
        trackIds: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    changePlaylistOrder: () => Promise.resolve(),
  };

  window.TAG_API = {
    getAllTags: () => Promise.resolve([]),
    getSubsetOfTags: () => Promise.resolve([]),
    insertTag: (data) => Promise.resolve({ id: 'stub-tag', ...data }),
    getTagSuggestion: () => Promise.resolve([]),
    deleteTag: () => Promise.resolve(),
    clearOrphanedTags: () => Promise.resolve(0),
    getTagsTrackCount: () => Promise.resolve({}),
    updateTag: (tag) => Promise.resolve(tag),
    getTagDetails: () => Promise.resolve([]),
  };

  window.DISCORD_API = {
    getChannels: () => Promise.resolve([]),
    joinChannel: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    onStateUpdate: () => undefined,
    onActiveTokensUpdate: () => undefined,
    connectToken: () => Promise.resolve(true),
    disconnectToken: () => Promise.resolve(true),
    getConnectedTokens: () => Promise.resolve([]),
    getTokenChannels: () => Promise.resolve([]),
  };

  window.DISCORD_TOKEN_API = {
    createToken: (data) =>
      Promise.resolve({
        id: 'stub-token',
        apiKey: data.apiKey,
        name: data.name,
        updatedAt: new Date(0),
        lastUsedAt: new Date(0),
        active: data.active ?? false,
      }),
    getAllTokens: () => Promise.resolve([]),
    updateToken: (id, newData) =>
      Promise.resolve({
        id,
        apiKey: newData.apiKey,
        name: newData.name,
        updatedAt: new Date(0),
        lastUsedAt: new Date(0),
        active: newData.active ?? false,
      }),
    deleteToken: () => Promise.resolve(true),
  };

  window.SOUND_EFFECT_API = {
    getAll: () => Promise.resolve([]),
    getById: () => Promise.resolve(null),
    create: (data) =>
      Promise.resolve({ id: 'stub-sound-effect', ...data }),
    update: (data) => Promise.resolve({ id: data.id, name: data.name ?? '', url: data.url ?? '', duration: data.duration ?? 0 }),
    deleteById: () => Promise.resolve(true),
    changeSoundEffectOrder: () => Promise.resolve(),
  };

  window.IMAGE_API = {
    fetchImage: () => Promise.resolve(null),
    openPicker: () => Promise.resolve(null),
    processAndSave: () => Promise.resolve(''),
    deleteImage: () => Promise.resolve(),
  };

  window.SCENE_API = {
    getAllScenes: () => Promise.resolve([]),
    getSceneById: () => Promise.resolve(undefined),
    insertScene: (data) =>
      Promise.resolve({
        id: 'stub-scene',
        name: data.name,
        tags: data.tags,
        playlistId: data.playlistId ?? null,
        introTrackIds: [],
        ambience: [],
        stingers: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    updateScene: (data) =>
      Promise.resolve({
        id: data.id,
        name: data.name ?? 'stub-scene',
        tags: [],
        playlistId: data.playlistId ?? null,
        introTrackIds: data.introTrackIds ?? [],
        ambience: [],
        stingers: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    deleteScene: () => Promise.resolve(),
    changeScenesOrder: () => Promise.resolve([]),
  };

  window.NOTIFICATION_API = {
    onNotification: () => undefined,
  };

  window.SESSION_API = {
    getAllSessions: () => Promise.resolve([]),
    getSessionById: () => Promise.resolve(null),
    insertSession: (insertQuery) =>
      Promise.resolve({
        id: 'stub-session',
        name: insertQuery.name,
        scenes: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    updateSession: (updateQuery) =>
      Promise.resolve({
        id: updateQuery.id,
        name: updateQuery.name ?? 'stub-session',
        scenes: [],
        order: 0,
        dateCreated: new Date(0),
        dateUpdated: new Date(0),
      }),
    deleteSession: () => Promise.resolve(),
    getSessionScenes: () => Promise.resolve([]),
    getSessionImages: () => Promise.resolve({}),
  };
}

/**
 * jsdom does not implement `ResizeObserver`. Several components rely on it
 * (e.g. for measuring overflow), so a minimal no-op stub is installed here.
 */
function installResizeObserverStub(): void {
  if (typeof globalThis.ResizeObserver !== 'undefined') {
    return;
  }

  class ResizeObserverStub {
    observe(): void {
      // no-op
    }
    unobserve(): void {
      // no-op
    }
    disconnect(): void {
      // no-op
    }
  }

  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

installWindowApiStubs();
installResizeObserverStub();
