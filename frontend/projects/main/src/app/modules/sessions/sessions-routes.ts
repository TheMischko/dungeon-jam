import { Route } from '@angular/router';
import { sessionsRouteStrings } from './sessions-route-strings';
import { SessionsLandingSmartComponent } from './pages/sessions-landing-smart/sessions-landing-smart.component';
import { SessionDetailSmartComponent } from './pages/session-detail-smart/session-detail-smart.component';

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
  {
    path: `${sessionsRouteStrings.sessionDetail}/:sessionId`,
    component: SessionDetailSmartComponent,
  },
];
