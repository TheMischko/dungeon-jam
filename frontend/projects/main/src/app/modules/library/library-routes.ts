import {Route} from '@angular/router';
import {libraryRouteStrings} from './library-route-strings';
import {LibraryLandingPageComponent} from './pages/library-landing-page/library-landing-page.component';

export const libraryRoutes: Route[] = [
  {
    path: '',
    redirectTo: libraryRouteStrings.library,
    pathMatch: 'full'
  },
  {
    path: libraryRouteStrings.library,
    component: LibraryLandingPageComponent
  }
]
