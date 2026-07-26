import {
  ChangeDetectionStrategy,
  Component,
  effect,
  model,
  output,
  signal,
} from '@angular/core';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import {
  ActionsMenuBaseConfig,
  ActionsMenuComponent,
} from '@general/components/display/actions-menu/actions-menu.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { FilterMatchType } from '@shared/models/request.model';

@Component({
  selector: 'app-filter-settings',
  imports: [IconButtonComponent, ActionsMenuComponent, MatMenu, MatMenuTrigger],
  templateUrl: './filter-settings.component.html',
  styleUrl: './filter-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSettingsComponent {
  readonly value = model<FilterMatchType>(FilterMatchType.ANY);
  readonly matchingChange = output<FilterMatchType>();
  readonly label = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const value = this.value();
      if (value === FilterMatchType.ANY) {
        this.label.set('+');
      } else {
        this.label.set('=');
      }
      this.matchingChange.emit(value);
    });
  }

  readonly filtersIcon = actionsIconSet.FilterIcon;
  filterOptions: ActionsMenuBaseConfig<null>[] = [
    {
      text: 'Any',
      tooltip: 'Result must match minimum of 1 filter.',
      onSelected: () => {
        this.value.set(FilterMatchType.ANY);
      },
    },
    {
      text: 'All',
      tooltip: 'Result must match all filters.',
      onSelected: () => {
        this.value.set(FilterMatchType.ALL);
      },
    },
  ];
}
