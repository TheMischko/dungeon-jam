import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { QueryOptions } from '@shared/models/request.model';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import {
  TableActionsConfigFn,
  TableColumnConfiguration,
  TableTrackByFn,
  TableUniquenessFn,
} from '../../../models/table.model';
import { TableComponent } from '../table.component';

@Component({
  selector: 'app-smart-table',
  imports: [SearchBarComponent, TableComponent],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartTableComponent<T> {
  readonly config = input.required<TableColumnConfiguration<T>>();
  readonly dataSet = input<T[]>([]);
  readonly selection = input<boolean>(false);
  readonly allSelectedState = input<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked',
  );
  readonly actionsFn = input<TableActionsConfigFn<T>>();
  readonly trackBy = input<TableTrackByFn<T>>((index: number, _: T) => index);
  readonly uniquenessFn = input<TableUniquenessFn<T>>((_, __) => false);

  readonly selected = output<T[]>();
  readonly menuClosed = output<{ row: T; reason: string }>();
  readonly hoverStart = output<T>();
  readonly hoverEnd = output<T>();
  readonly queryChange = output<QueryOptions>();

  readonly currentSearch = signal<string>('');
  readonly currentSortBy = signal<string | undefined>(undefined);
  readonly currentSortDirection = signal<SortDirection>(SortDirection.ASC);

  readonly currentQuery = computed<QueryOptions>(() => {
    const query: QueryOptions = {
      filter: this.currentSearch(),
      sortBy: this.currentSortBy(),
      sortDirection: this.currentSortDirection(),
    };
    return query;
  });

  constructor() {
    effect(() => {
      this.queryChange.emit(this.currentQuery());
    });

    effect(() => {
      const config = this.config();
      const configValues = Object.values(config);
      const defaultSortColumn =
        configValues.find((c) => c?.isDefaultSortColumn) ??
        configValues.find((c) => c?.sortable);
      if (!defaultSortColumn) {
        return;
      }
      const columnIndex = configValues.indexOf(defaultSortColumn);
      this.currentSortBy.set(Object.keys(config)[columnIndex]);
    });
  }

  setSort(event: { sortBy: string; sortDirection: SortDirection }) {
    this.currentSortBy.set(event.sortBy);
    this.currentSortDirection.set(event.sortDirection);
  }
}
