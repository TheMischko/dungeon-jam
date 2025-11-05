import { DatabaseWrapper } from './database';
import { DatabaseTable } from './init-database';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { v4 as uuid } from 'uuid';

export class DatabaseProvider<T> {
  private readonly table: DatabaseTable;
  private readonly idColumn: keyof T;
  private readonly filter: FilterFn<T>;
  private readonly sort: SortFn<T>;

  constructor(
    private database: DatabaseWrapper,
    table: DatabaseTable = 'tracks',
    idColumn: keyof T = 'id' as keyof T,
    filter: FilterFn<T> = () => true,
    sort: SortFn<T> = (itemA, itemB, sortBy, direction) =>
      (Number(itemA?.[sortBy as keyof T] ?? 0) -
        Number(itemB?.[sortBy as keyof T] ?? 0)) *
      (direction === SortDirection.ASC ? 1 : -1),
  ) {
    this.table = table;
    this.idColumn = idColumn;
    this.filter = filter;
    this.sort = sort;
  }

  getAll(query?: QueryOptions): Promise<T[]> {
    return new Promise((resolve) => {
      let data: T[] = [...(this.database.readTable<T[]>(this.table) ?? [])];
      if (query?.filter) {
        data = data.filter((item: T) => this.filter(item, query.filter!));
      }
      if (query?.sortBy && query?.sortDirection) {
        data = data.sort((a, b) =>
          this.sort(a, b, query.sortBy!, query.sortDirection!),
        );
      }

      resolve(data);
    });
  }

  getBy<V>(column: keyof T, value: V): Promise<T | null> {
    return new Promise(async (resolve) => {
      const data: T[] = await this.getAll();
      const result =
        data.find((item) => {
          const itemValue = item[column] as V;
          return itemValue === value;
        }) ?? null;
      resolve(result);
    });
  }

  getSome<V>(column: keyof T, values: V[]): Promise<T[]> {
    return new Promise<T[]>(async (resolve) => {
      const data: T[] = await this.getAll();
      if (data.length === 0) {
        resolve([]);
        return;
      }
      const isString =
        column !== this.idColumn && typeof data[0][column] === 'string';
      const result = data.filter((item) => {
        return values.some((searchVal) => {
          if (isString) {
            return (item[column] as string).includes(searchVal as string);
          }
          return item[column] === searchVal;
        });
      });
      resolve(result);
    });
  }

  create<V = Partial<T>>(data: V, id?: string): Promise<T> {
    return new Promise(async (resolve) => {
      if (id) {
        const matching = await this.getBy(this.idColumn, id);
        if (matching) {
          resolve(matching);
          return;
        }
      }
      const newItem: T = {
        ...data,
        [this.idColumn]: id ?? uuid(),
      } as T;
      const allData = await this.getAll();
      await this.database.updateTable(this.table, [...allData, newItem]);
      resolve(newItem);
    });
  }

  update<V>(column: keyof T, matchValue: V, newValue: T): Promise<T> {
    return new Promise<T>(async (resolve) => {
      const data = await this.getAll();
      const existingIndex = data.findIndex(
        (item: T) => matchValue === (item[column] as V),
      );

      if (existingIndex === -1) {
        resolve(await this.create(newValue));
        return;
      }

      data[existingIndex] = newValue;
      await this.database.updateTable(this.table, data);
      resolve(newValue);
    });
  }

  deleteOne<V>(column: keyof T, matchValue: V): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const data = await this.getAll();
      const deleteIndex = data.findIndex(
        (item: T) => matchValue === (item[column] as V),
      );

      if (deleteIndex === -1) {
        resolve(true);
        return;
      }

      data.splice(deleteIndex, 1);
      await this.database.updateTable(this.table, data);
      resolve(true);
    });
  }
}

export type FilterFn<T> = (item: T, filter: string) => boolean;
export type SortFn<T> = (
  itemA: T,
  itemB: T,
  sortBy: string,
  direction: SortDirection,
) => number;
