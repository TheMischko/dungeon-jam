import { computed, effect, signal } from '@angular/core';
import { TableColumnConfiguration } from '../../../models/table.model';

export class ColumnStateManager<T> {
  readonly config = signal<TableColumnConfiguration<T>>({});
  private readonly enabledMap = signal<Record<string, boolean>>({});

  readonly collapsibleColumns = computed<TableColumnConfiguration<T>>(() => {
    const config = this.config();
    return Object.entries(config)
      .filter(([_, columnConfig]) => !!columnConfig?.canCollapse)
      .reduce(
        (map, [colName, colConfig]) => ({ ...map, [colName]: colConfig! }),
        {}
      );
  });

  readonly enabledColumns = computed<string[]>(() => {
    const config = this.config();
    const columnNames = Object.keys(config);
    return columnNames.filter((columnName) => {
      const isCollapsible = !!config[columnName]?.canCollapse;
      if (!isCollapsible) {
        return true;
      }
      return this.enabledMap()[columnName];
    });
  });

  constructor() {
    effect(() => {
      const config = this.collapsibleColumns();
      this.enabledMap.update((oldMap) => {
        const oldColumns = Object.keys(oldMap);
        const newColumns = Object.keys(config);

        const newColumnsMap = newColumns
          .filter((column) => !oldColumns.includes(column))
          .reduce((map, column) => ({ ...map, [column]: true }), {});

        return {
          ...oldMap,
          ...newColumnsMap,
        };
      });
    });
  }

  toggleColumn(columnName: string) {
    if (this.enabledMap()[columnName] === undefined) {
      return;
    }
    this.enabledMap.update((map) => ({
      ...map,
      [columnName]: !map[columnName],
    }));
  }
}
