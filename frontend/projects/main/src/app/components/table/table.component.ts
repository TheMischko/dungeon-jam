import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
    'unchecked',
  );
  readonly actionsFn = input<TableActionsConfigFn<T>>();
  readonly trackBy = input<TableTrackByFn<T>>((index: number, _: T) => index);
  readonly uniquenessFn = input<TableUniquenessFn<T>>((_, __) => false);

  readonly selected = output<T[]>();
  readonly menuClosed = output<{ row: T; reason: string }>();
  readonly hoverStart = output<T>();
  readonly hoverEnd = output<T>();

  readonly ActionsIcon = actionsIconSet.ActionsMenu;
  readonly selectionColumn = 'checkbox';
  readonly actionsColumn = 'actions';

  readonly configColumnNames = computed<string[]>(() => {
    return Object.keys(this.config());
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
    () => this.allSelectedState() === 'checked',
  );
  readonly isAllIndeterminate = computed<boolean>(
    () => this.allSelectedState() === 'indeterminate',
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
      this.uniquenessFn()(selectedItem, row),
    );
  }

  itemSelected(row: T, event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedItems.update((selection) => [...selection, row]);
    } else {
      this.selectedItems.update((selection) =>
        selection.filter((item) => !this.uniquenessFn()(item, row)),
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
}
