import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { FilterMatchType, QueryOptions } from '@shared/models/request.model';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import {
  TableActionsConfigFn,
  TableColumnConfiguration,
  TableTrackByFn,
  TableUniquenessFn,
} from '../../../models/table.model';
import { TableComponent } from '../table.component';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { FilterSettingsComponent } from '../../filters/filter-settings/filter-settings.component';
import { TagsFilterComponent } from '../../filters/tags-filter/tags-filter.component';
import { PlaylistFilterComponent } from '../../filters/playlist-filter/playlist-filter.component';
import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';
import { MatMenu } from '@angular/material/menu';
import { ColumnStateManager } from './column-state.manager';
import { MatCheckbox } from '@angular/material/checkbox';
import { FilterQuery } from '@shared/models/filter.model';
import { PageEvent } from '@angular/material/paginator';
import { PaginationConfig } from '../../../models/pagination.model';

@Component({
  selector: 'app-smart-table',
  imports: [
    SearchBarComponent,
    TableComponent,
    LoaderComponent,
    FilterSettingsComponent,
    TagsFilterComponent,
    PlaylistFilterComponent,
    MatMenu,
    MatCheckbox,
  ],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartTableComponent<T> implements AfterViewInit {
  private readonly columnStateManager = new ColumnStateManager<T>();
  readonly config = input.required<TableColumnConfiguration<T>>();
  readonly dataSet = input<T[]>([]);
  readonly selection = input<boolean>(false);
  readonly allSelectedState = input<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly actionsFn = input<TableActionsConfigFn<T>>();
  readonly trackBy = input<TableTrackByFn<T>>((index: number, _: T) => index);
  readonly uniquenessFn = input<TableUniquenessFn<T>>((_, __) => false);
  readonly loading = input<boolean>(false);
  readonly noDataText = input<string>('No data available');
  readonly noResultsText = input<string>('No results found');
  readonly filterEnabled = input<boolean>(false);
  readonly showControls = input<boolean>(true);
  readonly pagination = input<PaginationConfig | null>(null);
  readonly hiddenColumns = input<string[]>([]);
  readonly customRowAttributeName = input<string | undefined>(undefined);
  readonly customRowAttributeValueFn = input<((item: T) => string) | undefined>(
    undefined
  );

  readonly selected = output<T[]>();
  readonly menuClosed = output<{ row: T; reason: string }>();
  readonly hoverStart = output<T>();
  readonly hoverEnd = output<T>();
  readonly queryChange = output<QueryOptions>();
  readonly pageChange = output<PageEvent>();

  readonly currentSearch = signal<string>('');
  readonly currentSortBy = signal<string | undefined>(undefined);
  readonly currentSortDirection = signal<SortDirection>(SortDirection.ASC);
  readonly currentFilters = signal<FilterQuery>(new FilterQuery());
  readonly afterViewInit = signal(false);

  readonly currentQuery = computed<QueryOptions>(() => {
    const query: QueryOptions = {
      search: this.currentSearch(),
      sortBy: this.currentSortBy(),
      sortDirection: this.currentSortDirection(),
      filters: this.currentFilters(),
    };
    return query;
  });

  readonly collapsibleColumns = this.columnStateManager.collapsibleColumns;
  readonly collapsibleColumnNames = computed<string[]>(() => {
    const columns = this.collapsibleColumns();
    return Object.keys(this.collapsibleColumns()).filter((col) => {
      return !!columns[col]?.title?.length;
    });
  });
  readonly enabledColumns = this.columnStateManager.enabledColumns;

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

    effect(() => {
      const config = this.config();
      this.columnStateManager.config.set(config);
    });

    const initHiddenEffect = effect(() => {
      const hiddenColumns = this.hiddenColumns();
      const enabledColumns = this.columnStateManager.enabledColumns();
      if (!this.afterViewInit()) {
        return;
      }
      hiddenColumns.forEach((col) => {
        if (enabledColumns.includes(col)) {
          this.columnStateManager.toggleColumn(col);
        }
      });
      return () => initHiddenEffect.destroy();
    });
  }

  ngAfterViewInit() {
    this.afterViewInit.set(true);
  }

  setSort(event: { sortBy: string; sortDirection: SortDirection }) {
    this.currentSortBy.set(event.sortBy);
    this.currentSortDirection.set(event.sortDirection);
  }

  protected emitPlaylistFilters(playlists: Playlist[]) {
    this.currentFilters.update((filters) => {
      if (!playlists.length) {
        return filters.removeFilter('playlist');
      }
      return filters.updateFilter(
        'playlist',
        playlists.map((p) => p.id)
      );
    });
  }

  protected emitTagFilters(tags: TagData[]) {
    this.currentFilters.update((filters) => {
      if (!tags.length) {
        return filters.removeFilter('tag');
      }
      return filters.updateFilter(
        'tag',
        tags.map((t) => t.id)
      );
    });
  }

  protected isColumnEnabled(columnName: string): boolean {
    return this.enabledColumns().includes(columnName);
  }

  protected toggleColumn(colName: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.columnStateManager.toggleColumn(colName);
  }

  protected updateFilterMatchingType(matchType: FilterMatchType) {
    this.currentFilters.update((filters) => {
      return filters.updateMatchType(matchType);
    });
  }
}
