import { Route } from '@angular/router';
import { TagsPageSmartComponent } from './pages/tags-page/tags-page-smart/tags-page-smart.component';
import { TagDetailPageSmartComponent } from './pages/tag-detail-page/tag-detail-page-smart/tag-detail-page-smart.component';
import { tagRouteStrings } from './tag-route-strings';

export const tagsRoutes: Route[] = [
  {
    path: '',
    redirectTo: tagRouteStrings.tags,
    pathMatch: 'full',
  },
  {
    path: tagRouteStrings.tags,
    component: TagsPageSmartComponent,
  },
  {
    path: `${tagRouteStrings.detail}/:id`,
    component: TagDetailPageSmartComponent,
  },
];
