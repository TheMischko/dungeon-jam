import { DatabaseWrapper } from './database';
import { DatabaseTable } from './init-database';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { v4 as uuid } from 'uuid';
import {
  DefaultGetSomeOptions,
  GetSomeMatch,
  GetSomeOptions,
} from './database-provider.model';
import { FilterQuery } from '@shared/models/filter.model';
import { ErrorCode } from '@shared/models/error.model';
import { createAppError } from '../utils/create-app-error';
import { isAppError } from '../utils/ipc-handler';

export class DatabaseProvider<T> {
  private readonly table: DatabaseTable;
  private readonly idColumn: keyof T;
  private readonly search: SearchFn<T>;
  private readonly sort: SortFn<T>;
  private readonly filter: FilterFn<T>;

  constructor(
    private database: DatabaseWrapper,
    table: DatabaseTable = 'tracks',
    idColumn: keyof T = 'id' as keyof T,
    search: SearchFn<T> = () => true,
    sort: SortFn<T> = (itemA, itemB, sortBy, direction) =>
      (Number(itemA?.[sortBy as keyof T] ?? 0) -
        Number(itemB?.[sortBy as keyof T] ?? 0)) *
      (direction === SortDirection.ASC ? 1 : -1),
    filter: FilterFn<T> = () => true
  ) {
    this.table = table;
    this.idColumn = idColumn;
    this.search = search;
    this.sort = sort;
    this.filter = filter;
  }

  async getAll(query?: QueryOptions): Promise<T[]> {
    let data: T[] = [...(this.database.readTable<T[]>(this.table) ?? [])];

    try {
      if (query?.search) {
        const searchResults = await Promise.all(
          data.map((item: T) => this.search(item, query.search!.toLowerCase()))
        );
        data = data.filter((_, index) => searchResults[index]);
      }

      if (query?.filters) {
        const filters = new FilterQuery(
          query.filters['_matchType'],
          query.filters['_filters']
        );
        const filterResults = await Promise.all(
          data.map((item: T) => this.filter(item, filters))
        );
        data = data.filter((_, index) => filterResults[index]);
      }

      if (query?.sortBy && query?.sortDirection) {
        data = data.sort((a, b) =>
          this.sort(a, b, query.sortBy!, query.sortDirection!)
        );
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseQueryFailed,
        'Query operation failed.'
      );
    }

    return data;
  }

  async getBy<V>(column: keyof T, value: V): Promise<T | null> {
    const data: T[] = await this.getAll();
    return (
      data.find((item) => {
        const itemValue = item[column] as V;
        return itemValue === value;
      }) ?? null
    );
  }

  async getSome<V>(
    column: keyof T,
    values: V[],
    options: GetSomeOptions = DefaultGetSomeOptions
  ): Promise<T[]> {
    const data: T[] = await this.getAll();
    if (data.length === 0) {
      return [];
    }
    const result = data.filter((item) =>
      this.getSomeFilter(item, column, values, options)
    );
    return result.slice(0, options.limit ?? undefined);
  }

  async getMatching<V>(
    matchingFn: (item: T) => boolean,
    queryOptions?: QueryOptions
  ): Promise<T[]> {
    const data: T[] = await this.getAll(queryOptions);
    return data.filter(matchingFn);
  }

  async create<V = Partial<T>>(data: V, id?: string): Promise<T> {
    try {
      if (id) {
        const matching = await this.getBy(this.idColumn, id);
        if (matching) {
          return matching;
        }
      }
      const newItem: T = {
        ...data,
        [this.idColumn]: id ?? uuid(),
      } as T;
      const allData = await this.getAll();
      await this.database.updateTable(this.table, [...allData, newItem]);
      return newItem;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseInsertFailed,
        'Insert operation failed.'
      );
    }
  }

  async createMultiple(data: T[]): Promise<T[]> {
    try {
      const createData = data.map((item) => ({
        [this.idColumn]: item[this.idColumn] ? item[this.idColumn] : uuid(),
        ...item,
      })) as T[];
      const allData = await this.getAll();
      await this.database.updateTable(this.table, [...allData, ...createData]);
      return createData;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseInsertFailed,
        'Insert operation failed.'
      );
    }
  }

  async replaceMultiple(data: T[]): Promise<T[]> {
    try {
      const allData = await this.getAll();
      const updatesMap = new Map(
        data.map((item) => [item[this.idColumn], item])
      );
      const updatedData = allData.map((item) => {
        const update = updatesMap.get(item[this.idColumn]);
        if (!update) {
          return item;
        }
        return {
          ...item,
          ...update,
        };
      });
      await this.database.updateTable(this.table, updatedData);
      return data;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseUpdateFailed,
        'Update operation failed.'
      );
    }
  }

  async update<V>(column: keyof T, matchValue: V, newValue: T): Promise<T> {
    try {
      const data = await this.getAll();
      const existingIndex = data.findIndex(
        (item: T) => matchValue === (item[column] as V)
      );

      if (existingIndex === -1) {
        // Pass the ID from newValue so create() never generates a UUID
        return await this.create(newValue, String(newValue[this.idColumn]));
      }

      data[existingIndex] = newValue;
      await this.database.updateTable(this.table, data);
      return newValue;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseUpdateFailed,
        'Update operation failed.'
      );
    }
  }

  async deleteOne<V>(column: keyof T, matchValue: V): Promise<boolean> {
    try {
      const data = await this.getAll();
      const deleteIndex = data.findIndex(
        (item: T) => matchValue === (item[column] as V)
      );

      if (deleteIndex === -1) {
        return true;
      }

      data.splice(deleteIndex, 1);
      await this.database.updateTable(this.table, data);
      return true;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseDeleteFailed,
        'Delete operation failed.'
      );
    }
  }

  async deleteMultiple(matchingFn: (item: T) => boolean): Promise<boolean> {
    try {
      const data = await this.getAll();
      const filtered = data.filter((item) => !matchingFn(item));
      await this.database.updateTable(this.table, filtered);
      return true;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseDeleteFailed,
        'Delete operation failed.'
      );
    }
  }

  async replaceRecord(newRecord: T): Promise<T> {
    try {
      const data = await this.getAll();
      const recordId = newRecord[this.idColumn];
      const existingIndex = data.findIndex(
        (item: T) => recordId === item[this.idColumn]
      );

      if (existingIndex === -1) {
        throw createAppError(ErrorCode.DatabaseNotFound, `Record not found.`, {
          id: recordId,
        });
      }

      data[existingIndex] = newRecord;
      await this.database.updateTable(this.table, data);
      return newRecord;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw createAppError(
        ErrorCode.DatabaseUpdateFailed,
        'Update operation failed.'
      );
    }
  }

  private getSomeFilter<V>(
    item: T,
    column: keyof T,
    matchValues: V[],
    options: GetSomeOptions
  ): boolean {
    const itemValue = item[column];
    switch (options.match) {
      case GetSomeMatch.CONTAINS:
        return this.contains(itemValue as string, matchValues as string[]);
      case GetSomeMatch.STARTS_WITH:
        return this.startsWith(itemValue as string, matchValues as string[]);
      default:
        return this.equalMatch(itemValue as V, matchValues);
    }
  }

  private contains<V>(value: V, matchValues: V[]) {
    if (typeof value === 'string') {
      return matchValues.some((toMatch) =>
        (<string>value).toLowerCase().includes((<string>toMatch).toLowerCase())
      );
    }
    return false;
  }

  private startsWith<V>(value: V, matchValues: V[]) {
    if (typeof value === 'string') {
      return matchValues.some((toMatch) =>
        (<string>value).startsWith(<string>toMatch)
      );
    }
    return false;
  }

  private equalMatch<V>(value: V, matchValues: V[]) {
    return matchValues.some((toMatch) => toMatch === value);
  }
}

export type SearchFn<T> = (
  item: T,
  filter: string
) => boolean | Promise<boolean>;

export type SortFn<T> = (
  itemA: T,
  itemB: T,
  sortBy: string,
  direction: SortDirection
) => number;

export type FilterFn<T> = (
  item: T,
  filterQuery: FilterQuery
) => boolean | Promise<boolean>;
