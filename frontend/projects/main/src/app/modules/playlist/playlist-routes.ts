import { Route } from '@angular/router';
import { playlistRouteStrings } from './playlist-route-strings';
import { PlaylistsLandingPageComponent } from './pages/playlists-landing-page/playlists-landing-page.component';
import { PlaylistsDetailPageSmartComponent } from './pages/playlists-detail-page/playlists-detail-page-smart/playlists-detail-page-smart.component';

export const playlistRoutes: Route[] = [
  {
    path: '',
    redirectTo: playlistRouteStrings.playlists,
    pathMatch: 'full',
  },
  {
    path: playlistRouteStrings.playlists,
    component: PlaylistsLandingPageComponent,
  },
  {
    path: `${playlistRouteStrings.detail}/:id`,
    component: PlaylistsDetailPageSmartComponent,
  },
];
