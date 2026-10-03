export type TrackHighlightContext =
  | { type: TrackHighlightType.LIBRARY }
  | { type: TrackHighlightType.PLAYLIST; playlistId: string }
  | { type: TrackHighlightType.SCENE; sceneId: string }
  | { type: TrackHighlightType.SESSION; sessionId: string };

export enum TrackHighlightType {
  PLAYLIST = 'playlist',
  SCENE = 'scene',
  SESSION = 'session',
  LIBRARY = 'library',
}

export interface TrackHighlightRequest {
  context: TrackHighlightContext;
  trackId: string;
}

export const createLibraryContext = (): TrackHighlightContext => ({
  type: TrackHighlightType.LIBRARY,
});

export const createPlaylistContext = (
  playlistId: string
): TrackHighlightContext => ({
  type: TrackHighlightType.PLAYLIST,
  playlistId,
});

export const createSceneContext = (sceneId: string): TrackHighlightContext => ({
  type: TrackHighlightType.SCENE,
  sceneId,
});

export const createSessionContext = (
  sessionId: string
): TrackHighlightContext => ({
  type: TrackHighlightType.SESSION,
  sessionId,
});
