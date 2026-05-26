import { Route } from '@angular/router';
import { sessionsRouteStrings } from './sessions-route-strings';
import { SessionsLandingSmartComponent } from './pages/sessions-landing-smart/sessions-landing-smart.component';

export const sessionsRoutes: Route[] = [
  {
    path: '',
    redirectTo: sessionsRouteStrings.sessionsLanding,
    pathMatch: 'full',
  },
  {
    path: sessionsRouteStrings.sessionsLanding,
    component: SessionsLandingSmartComponent,
  },
];
