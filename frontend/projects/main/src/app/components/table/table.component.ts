import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  TableActionsConfigFn,
  TableColumnConfiguration,
  TableTrackByFn,
  TableUniquenessFn,
} from '../../models/table.model';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { TableCellComponent } from './table-cell/table-cell.component';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import {
  ActionsMenuComponent,
  ActionsMenuConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import {
  MatMenu,
  MatMenuTrigger,
  MenuCloseReason,
} from '@angular/material/menu';
import { actionsIconSet } from '@general/icons/icons';
import {
  MatSort,
  MatSortHeader,
  Sort,
  SortDirection as MatSortDirection,
} from '@angular/material/sort';
import { SortDirection } from '@shared/models/common.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationConfig } from '../../models/pagination.model';
import { CustomTableRowAttrDirective } from '../../directives/custom-table-row-attr.directive';

@Component({
  selector: 'app-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    TableCellComponent,
    MatCheckbox,
    ActionsMenuComponent,
    IconButtonComponent,
    MatMenu,
    MatMenuTrigger,
    NgTemplateOutlet,
    MatSortHeader,
    MatSort,
    NgClass,
    MatPaginator,
    CustomTableRowAttrDirective,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> {
  readonly config = input.required<TableColumnConfiguration<T>>();
  readonly dataSet = input<T[]>([]);
  readonly selection = input<boolean>(false);
  readonly allSelectedState = input<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly actionsFn = input<TableActionsConfigFn<T>>();
  readonly trackBy = input<TableTrackByFn<T>>((index: number, _: T) => index);
  readonly uniquenessFn = input<TableUniquenessFn<T>>((_, __) => false);
  readonly headerCellMenu = input<MatMenu | null>(null);
  readonly visibleColumns = input<string[] | null>(null);
  readonly pagination = input<PaginationConfig | null>(null);
  readonly customRowAttributeName = input<string | undefined>(undefined);
  readonly customRowAttributeValueFn = input<((item: T) => string) | undefined>(
    undefined
  );
  readonly defaultSortBy = model<string>('');
  readonly defaultSortDirection = model<SortDirection>(SortDirection.ASC);

  readonly matSortDirection = computed<MatSortDirection>(() => {
    return this.defaultSortDirection() === SortDirection.ASC ? 'asc' : 'desc';
  });

  readonly selected = output<T[]>();
  readonly menuClosed = output<{ row: T; reason: string }>();
  readonly hoverStart = output<T>();
  readonly hoverEnd = output<T>();
  readonly sortChange = output<{
    sortBy: string;
    sortDirection: SortDirection;
  }>();
  readonly pageChange = output<PageEvent>();

  readonly ActionsIcon = actionsIconSet.ActionsMenu;
  readonly selectionColumn = 'checkbox';
  readonly actionsColumn = 'actions';

  readonly configColumnNames = computed<string[]>(() => {
    return this.visibleColumns() ?? Object.keys(this.config());
  });

  readonly columnNames = computed<string[]>(() => {
    const columns = [];
    if (this.selection()) {
      columns.push(this.selectionColumn);
    }
    for (let columnName of this.configColumnNames()) {
      columns.push(columnName);
    }
    if (this.hasActions()) {
      columns.push(this.actionsColumn);
    }
    return columns;
  });

  readonly hasActions = computed<boolean>(() => {
    const actionFn = this.actionsFn();
    return actionFn !== null && typeof actionFn === 'function';
  });

  readonly isAllChecked = computed<boolean>(
    () => this.allSelectedState() === 'checked'
  );
  readonly isAllIndeterminate = computed<boolean>(
    () => this.allSelectedState() === 'indeterminate'
  );

  readonly selectedItems = signal<T[]>([]);

  getColumnNameKeyOf(column: string): keyof T {
    return column as keyof T;
  }

  getActionsMenuConfig(row: T): ActionsMenuConfig<T, unknown>[] {
    const actionFn = this.actionsFn();
    return actionFn!(row);
  }

  emitMenuClosed(row: T, event: MenuCloseReason) {
    this.menuClosed.emit({ row, reason: event ?? '' });
  }

  isSelected(row: T): boolean {
    return this.selectedItems().some((selectedItem) =>
      this.uniquenessFn()(selectedItem, row)
    );
  }

  itemSelected(row: T, event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedItems.update((selection) => [...selection, row]);
    } else {
      this.selectedItems.update((selection) =>
        selection.filter((item) => !this.uniquenessFn()(item, row))
      );
    }
    this.selected.emit(this.selectedItems());
  }

  selectAllAvailable(event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedItems.set([...this.dataSet()]);
    } else {
      this.selectedItems.set([]);
    }
    this.selected.emit(this.selectedItems());
  }

  emitSortChange(event: Sort) {
    this.sortChange.emit({
      sortBy: event.active,
      sortDirection:
        event.direction === 'desc' ? SortDirection.DESC : SortDirection.ASC,
    });
  }

  protected onHeaderCellClicked(
    event: MouseEvent,
    colName: string,
    trigger: MatMenuTrigger
  ) {
    if (!this.headerCellMenu()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    trigger.menuData = { columnName: colName };
    trigger.openMenu();
  }
}
