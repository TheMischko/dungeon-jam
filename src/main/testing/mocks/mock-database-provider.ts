//@ts-nocheck
import { vi } from 'vitest';
import { DatabaseProvider } from '../../database/database-provider';

export const mockDatabaseProviderInstance = {
  getAll: vi.fn<[], Promise<any[]>>(() => Promise.resolve([])),
  getBy: vi.fn<[string, any], Promise<any>>(() => Promise.resolve(null)),
  getSubset: vi.fn<[string, any[], any], Promise<any[]>>(() =>
    Promise.resolve([]),
  ),
  getMatching: vi.fn<() => boolean, any>(() => Promise.resolve([])),
  create: vi.fn<[any], Promise<any>>(() => Promise.resolve({})),
  update: vi.fn<[any], Promise<any>>(() => Promise.resolve({})),
  delete: vi.fn<[any], Promise<boolean>>(() => Promise.resolve(true)),
} as unknown as DatabaseProvider<any>;

export class MockDatabaseProviderCreator {
  private table: string = '';
  private sort: any = null;
  private filter: any = null;
  private idColumn: string = 'id';

  static create<T>(): MockDatabaseProviderCreator {
    return new MockDatabaseProviderCreator();
  }

  setTable(table: string) {
    this.table = table;
    return this;
  }

  setIdColumn(idColumn: string) {
    this.idColumn = idColumn;
    return this;
  }

  setSort(sortFn: any) {
    this.sort = sortFn;
    return this;
  }

  setFilter(filterFn: any) {
    this.filter = filterFn;
    return this;
  }

  async complete(): Promise<DatabaseProvider<any>> {
    return mockDatabaseProviderInstance as any;
  }
}
