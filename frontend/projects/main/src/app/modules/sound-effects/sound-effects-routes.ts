import { Route } from '@angular/router';
import { soundEffectsRouteStrings } from './sound-effects-route-strings';
import { SoundEffectsLibrarySmartComponent } from './pages/sound-effects-library/sound-effects-library-smart/sound-effects-library-smart.component';

export const soundEffectsRoutes: Route[] = [
  {
    path: '',
    redirectTo: soundEffectsRouteStrings.library,
    pathMatch: 'full',
  },
  {
    path: `${soundEffectsRouteStrings.library}/:soundEffectId`,
    component: SoundEffectsLibrarySmartComponent,
  },
  {
    path: soundEffectsRouteStrings.library,
    component: SoundEffectsLibrarySmartComponent,
  },
];
