import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { BaseTableColumnConfiguration } from '../../../models/table.model';

@Component({
  selector: 'app-table-cell',
  imports: [],
  templateUrl: './table-cell.component.html',
  styleUrl: './table-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent<T> {
  readonly config = input<BaseTableColumnConfiguration<T>>();
  readonly item = input.required<T>();
  readonly columnKey = input.required<keyof T>();

  readonly cellValue = computed(() => {
    const customValueFn = this.config()?.customValueFn;
    if (customValueFn && typeof customValueFn === 'function') {
      return customValueFn(this.item());
    }
    return this.item()[this.columnKey()];
  });
}
