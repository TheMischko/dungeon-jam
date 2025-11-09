import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TableColumnConfiguration } from '../../models/table.model';
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
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> {
  readonly config = input.required<TableColumnConfiguration<T>>();
  readonly dataSet = input<T[]>([]);

  readonly columnNames = computed<string[]>(() => Object.keys(this.config()));

  getColumnNameKeyOf(column: string): keyof T {
    return column as keyof T;
  }
}
