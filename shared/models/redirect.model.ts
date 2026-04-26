export interface RedirectRequest {
  path: RedirectPath;
  params?: Record<string, any>;
}

export enum RedirectPath {
  HOME = 'home',
  LIBRARY = 'library',
  PLAYLISTS = 'playlists',
  TAGS = 'tags',
  SETTINGS = 'settings',
  SOUND_EFFECTS = 'sound-effects',
}
