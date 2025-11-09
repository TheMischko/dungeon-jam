export type TableColumnConfiguration<TableEntity> = {
  [columnName in
    | keyof TableEntity
    | string]?: BaseTableColumnConfiguration<TableEntity>;
};

export interface BaseTableColumnConfiguration<TableEntity> {
  title: string;
  customValueFn?: (item: TableEntity) => string;
}
