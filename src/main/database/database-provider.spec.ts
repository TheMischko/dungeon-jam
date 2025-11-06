import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  mockDatabase,
  mockDatabaseInstance,
} from '../testing/mocks/mock-database';
import { DatabaseProvider, FilterFn, SortFn } from './database-provider';
import { DatabaseWrapper } from './database';
import { DatabaseTable } from './init-database';
import { SortDirection } from '@shared/models/common.model';

vi.mock('./database', () => mockDatabase);

type TestEntity = {
  id: string;
  value: string;
  priority: number;
};

const testFilter: FilterFn<TestEntity> = (item, filter) => {
  return item.value.toLowerCase() === filter.toLowerCase();
};

const testSort: SortFn<TestEntity> = (itemA, itemB, sortBy, direction) => {
  const valA: string = (itemA[sortBy as keyof TestEntity] as string) ?? '';
  const valB: string = (itemB[sortBy as keyof TestEntity] as string) ?? '';
  return valA.localeCompare(valB) * (direction === SortDirection.ASC ? 1 : -1);
};

describe('DatabaseProvider', () => {
  let provider: DatabaseProvider<TestEntity>;
  const databaseMock = mockDatabaseInstance as unknown as DatabaseWrapper;
  const table = 'test' as DatabaseTable;

  const dataA: TestEntity = { id: 'a', value: 'Aaa', priority: 50 };
  const dataH: TestEntity = { id: 'h', value: 'hHh', priority: 25 };
  const dataZ: TestEntity = { id: 'z', value: 'zzZ', priority: 10 };

  const dataSet: TestEntity[] = [dataZ, dataA, dataH];

  beforeEach(() => {
    provider = new DatabaseProvider(
      databaseMock,
      table,
      'id',
      testFilter,
      testSort,
    );
    vi.spyOn(databaseMock, 'readTable').mockReturnValue(dataSet);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('should return all data if no query params are sent', async () => {
      const result = await provider.getAll();
      expect(result).toEqual(dataSet);
    });

    it('should sort the data', async () => {
      const result = await provider.getAll({
        sortBy: 'value',
        sortDirection: SortDirection.DESC,
      });
      expect(result).toEqual([dataZ, dataH, dataA]);
    });

    it('should filter the data', async () => {
      const result = await provider.getAll({ filter: dataH.value });
      expect(result).toEqual([dataH]);
    });
  });

  describe('getBy', () => {
    it('should find an matching item', async () => {
      const result = await provider.getBy('value', dataA.value);
      expect(result).toEqual(dataA);
    });

    it('should return null if not found', async () => {
      const result = await provider.getBy('value', 'test123');
      expect(result).toBeNull();
    });
  });

  describe('getSome', () => {
    it('should return matching records', async () => {
      const result = await provider.getSome('value', [
        dataA.value,
        dataH.value,
      ]);
      expect(result.includes(dataA)).toBeTruthy();
      expect(result.includes(dataH)).toBeTruthy();
    });

    it('should soft match records that include the value', async () => {
      const result = await provider.getSome('value', ['']);
      expect(result).toEqual(dataSet);
      const resultA = await provider.getSome('value', [
        dataA.value.slice(0, 1),
      ]);
      expect(resultA).toEqual([dataA]);
    });

    it('should find records for non-string values', async () => {
      const result = await provider.getSome('priority', [10, 50]);
      expect(result.includes(dataA)).toBeTruthy();
      expect(result.includes(dataZ)).toBeTruthy();
    });

    it('should return empty array if there are no data', async () => {
      vi.resetAllMocks();
      vi.spyOn(databaseMock, 'readTable').mockReturnValue([]);

      const result = await provider.getSome('value', ['a']);
      expect(result).toEqual([]);
    });
  });
});
