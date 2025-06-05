import {Route} from '@angular/router';
import {homeRouteStrings} from './home-route-strings';
import {HomeLandingPageComponent} from './pages/home-landing-page/home-landing-page.component';

export const homeRoutes: Route[] = [
  {
    path: '',
    redirectTo: homeRouteStrings.home,
    pathMatch: 'full'
  },
  {
    path: homeRouteStrings.home,
    component: HomeLandingPageComponent
  }
]
