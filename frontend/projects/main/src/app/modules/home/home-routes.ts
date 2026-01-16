import { Route } from '@angular/router';
import { homeRouteStrings } from './home-route-strings';
import { HomeLandingPageSmartComponent } from './pages/home-landing-page/home-landing-page-smart/home-landing-page-smart.component';

export const homeRoutes: Route[] = [
  {
    path: '',
    redirectTo: homeRouteStrings.home,
    pathMatch: 'full',
  },
  {
    path: homeRouteStrings.home,
    component: HomeLandingPageSmartComponent,
  },
];
