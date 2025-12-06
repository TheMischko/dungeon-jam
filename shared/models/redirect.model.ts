export interface RedirectRequest {
  path: RedirectPath;
  params?: Record<string, any>;
}

export enum RedirectPath {
  HOME = 'home',
  LIBRARY = 'library',
  PLAYLISTS = 'playlists',
  SETTINGS = 'settings',
}
