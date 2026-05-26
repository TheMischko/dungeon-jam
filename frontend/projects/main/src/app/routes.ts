import { Routes } from '@angular/router';
import { routesStrings } from './routes-strings';

export const routes: Routes = [
  {
    path: '',
    redirectTo: routesStrings.home,
    pathMatch: 'full',
  },
  {
    path: routesStrings.home,
    loadChildren: () =>
      import('./modules/home/home-routes').then((module) => module.homeRoutes),
  },
  {
    path: routesStrings.playlists,
    loadChildren: () =>
      import('./modules/playlist/playlist-routes').then(
        (module) => module.playlistRoutes
      ),
  },
  {
    path: routesStrings.library,
    loadChildren: () =>
      import('./modules/library/library-routes').then(
        (module) => module.libraryRoutes
      ),
  },
  {
    path: routesStrings.tags,
    loadChildren: () =>
      import('./modules/tags/tags-routes').then((module) => module.tagsRoutes),
  },
  {
    path: routesStrings.settings,
    loadChildren: () =>
      import('./modules/settings/settings-routes').then(
        (module) => module.settingsRoutes
      ),
  },
  {
    path: routesStrings.soundEffects,
    loadChildren: () =>
      import('./modules/sound-effects/sound-effects-routes').then(
        (module) => module.soundEffectsRoutes
      ),
  },
  {
    path: routesStrings.scenes,
    loadChildren: () =>
      import('./modules/scenes/scenes-routes').then(
        (module) => module.scenesRoutes
      ),
  },
  {
    path: routesStrings.sessions,
    loadChildren: () =>
      import('./modules/sessions/sessions-routes').then(
        (module) => module.sessionsRoutes
      ),
  },
];
