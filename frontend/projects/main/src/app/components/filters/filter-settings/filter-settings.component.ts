import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import {
  ActionsMenuBaseConfig,
  ActionsMenuComponent,
} from '@general/components/display/actions-menu/actions-menu.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-filter-settings',
  imports: [IconButtonComponent, ActionsMenuComponent, MatMenu, MatMenuTrigger],
  templateUrl: './filter-settings.component.html',
  styleUrl: './filter-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSettingsComponent {
  readonly filtersIcon = actionsIconSet.FilterIcon;
  filterOptions: ActionsMenuBaseConfig<null>[] = [
    {
      text: 'Any',
      onSelected() {
        console.log('or');
      },
    },
    {
      text: 'All',
      onSelected() {
        console.log('all');
      },
    },
  ];
}
