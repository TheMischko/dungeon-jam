import { Route } from '@angular/router';
import { settingsRouteStrings } from './settings-route-strings';
import {
  GeneralSettingsPageSmartComponent
} from './pages/general-settings-page/general-settings-page-smart/general-settings-page-smart.component';

export const settingsRoutes: Route[] = [
  {
    path: '',
    redirectTo: settingsRouteStrings.settings,
    pathMatch: 'full'
  },
  {
    path: settingsRouteStrings.general,
    component: GeneralSettingsPageSmartComponent
  }
]
