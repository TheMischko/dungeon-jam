import { ActionsMenuConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { TemplateRef } from '@angular/core';

export type TableColumnConfiguration<TableEntity> = {
  [columnName in
    | keyof TableEntity
    | string]?: BaseTableColumnConfiguration<TableEntity>;
};

export interface BaseTableColumnConfiguration<TableEntity> {
  title: string;
  width?: string;
  customValueFn?: (item: TableEntity) => string;
  template?: () => TemplateRef<{ $implicit: TableEntity }>;
  sortable?: boolean;
  isDefaultSortColumn?: boolean;
}

export type TableActionsConfigFn<T> = (
  row: T,
) => ActionsMenuConfig<T, unknown>[];

export type TableTrackByFn<T> = (index: number, item: T) => string | number;

export type TableUniquenessFn<T> = (a: T, b: T) => boolean;
