import { Routes } from '@angular/router';
import {routesStrings} from './routes-strings';

export const routes: Routes = [
  {
    path: '',
    redirectTo: routesStrings.home,
    pathMatch: 'full'
  },
  {
    path: routesStrings.home,
    loadChildren: () =>
      import('./modules/home/home-routes').then((module) => module.homeRoutes)
  },
  {
    path: routesStrings.playlists,
    loadChildren: () =>
      import('./modules/playlist/playlist-routes').then((module) => module.playlistRoutes)
  },
  {
    path: routesStrings.library,
    loadChildren: () =>
      import('./modules/library/library-routes').then((module) => module.libraryRoutes)
  }
];
