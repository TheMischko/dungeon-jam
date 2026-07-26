import { DatabaseTable } from './init-database';
import { DatabaseProvider, FilterFn, SearchFn, SortFn } from './database-provider';
import { DatabaseWrapper } from './database';
import { SortDirection } from '@shared/models/common.model';

export class DatabaseProviderCreator<T> {
  private tableName: DatabaseTable = 'tracks';
  private idColumn: keyof T = 'id' as keyof T;
  private searchFn: SearchFn<T> = () => true;
  private sortFn: SortFn<T> = (itemA, itemB, sortBy, direction) =>
    (Number(itemA?.[sortBy as keyof T] ?? 0) -
      Number(itemB?.[sortBy as keyof T] ?? 0)) *
    (direction === SortDirection.ASC ? 1 : -1);
  private filterFn: FilterFn<T> = () => true;

  static create<T>(): DatabaseProviderCreator<T> {
    return new DatabaseProviderCreator<T>();
  }

  setTable(table: DatabaseTable): this {
    this.tableName = table;
    return this;
  }

  setIdColumn(column: keyof T): this {
    this.idColumn = column;
    return this;
  }

  setSort(sort: SortFn<T>): this {
    this.sortFn = sort;
    return this;
  }

  setSearch(search: SearchFn<T>): this {
    this.searchFn = search;
    return this;
  }

  setFilter(filter: FilterFn<T>): this {
    this.filterFn = filter;
    return this;
  }

  async complete(): Promise<DatabaseProvider<T>> {
    const database = await DatabaseWrapper.getInstance();
    return new DatabaseProvider<T>(
      database,
      this.tableName,
      this.idColumn,
      this.searchFn,
      this.sortFn,
      this.filterFn,
    );
  }
}
