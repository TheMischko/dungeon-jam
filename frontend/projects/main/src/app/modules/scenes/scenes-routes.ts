import { Route } from '@angular/router';
import { scenesRouteStrings } from './scenes-route-strings';
import { ScenesLandingSmartComponent } from './pages/scenes-landing-smart/scenes-landing-smart.component';

export const scenesRoutes: Route[] = [
  {
    path: '',
    redirectTo: scenesRouteStrings.scenesLanding,
    pathMatch: 'full',
  },
  {
    path: scenesRouteStrings.scenesLanding,
    component: ScenesLandingSmartComponent,
  },
];
