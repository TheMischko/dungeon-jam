import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  mockDatabase,
  mockDatabaseInstance,
} from '../testing/mocks/mock-database';
import { DatabaseProvider, SearchFn, SortFn } from './database-provider';
import { DatabaseWrapper } from './database';
import { DatabaseTable } from './init-database';
import { SortDirection } from '@shared/models/common.model';
import { GetSomeMatch } from './database-provider.model';

vi.mock('./database', () => mockDatabase);

type TestEntity = {
  id: string;
  value: string;
  priority: number;
};

const testFilter: SearchFn<TestEntity> = (item, filter) => {
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
      const result = await provider.getAll({ search: dataH.value });
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
      const resultA = await provider.getSome(
        'value',
        [dataA.value.slice(0, 1)],
        { match: GetSomeMatch.CONTAINS },
      );
      expect(resultA).toEqual([dataA]);
    });

    it('should return empty array if match is contains and values are not string', async () => {
      const result = await provider.getSome('priority', [10], {
        match: GetSomeMatch.CONTAINS,
      });
      expect(result).toEqual([]);
    });

    it('should find records for non-string values', async () => {
      const result = await provider.getSome('priority', [10, 50]);
      expect(result.includes(dataA)).toBeTruthy();
      expect(result.includes(dataZ)).toBeTruthy();
    });

    it('should return matches that start with searched values', async () => {
      const result = await provider.getSome(
        'value',
        [dataH.value.slice(0, 2)],
        { match: GetSomeMatch.STARTS_WITH },
      );
      expect(result[0]).toEqual(dataH);
      const resultB = await provider.getSome('value', ['test'], {
        match: GetSomeMatch.STARTS_WITH,
      });
      expect(resultB.length).toEqual(0);
    });

    it('should return empty array if match is startWith and values are not string', async () => {
      const result = await provider.getSome('priority', [10], {
        match: GetSomeMatch.STARTS_WITH,
      });
      expect(result).toEqual([]);
    });

    it('should return empty array if there are no data', async () => {
      vi.resetAllMocks();
      vi.spyOn(databaseMock, 'readTable').mockReturnValue([]);

      const result = await provider.getSome('value', ['a']);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new entity with generated UUID if no id provided', async () => {
      const newEntity = { value: 'new', priority: 100 };
      const result = await provider.create(newEntity);

      expect(result.value).toBe('new');
      expect(result.priority).toBe(100);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should create a new entity with provided id if given', async () => {
      const newEntity = { value: 'new', priority: 100 };
      const customId = 'custom-id-123';
      const result = await provider.create(newEntity, customId);

      expect(result.id).toBe(customId);
      expect(result.value).toBe('new');
      expect(result.priority).toBe(100);
    });

    it('should return existing entity if id already exists', async () => {
      const result = await provider.create(
        { value: 'duplicate', priority: 999 },
        dataA.id,
      );

      expect(result).toEqual(dataA);
      expect(result.priority).not.toBe(999);
    });

    it('should add the new entity to the database', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');
      const newEntity = { value: 'new', priority: 100 };

      await provider.create(newEntity);

      expect(updateTableSpy).toHaveBeenCalledOnce();
      expect(updateTableSpy).toHaveBeenCalledWith(
        table,
        expect.arrayContaining([dataA, dataH, dataZ, expect.any(Object)]),
      );
    });
  });

  describe('update', () => {
    it('should update an existing entity by column match', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');
      const updatedEntity: TestEntity = {
        ...dataA,
        value: 'updated',
        priority: 999,
      };

      const result = await provider.update('id', dataA.id, updatedEntity);

      expect(result).toEqual(updatedEntity);
      expect(updateTableSpy).toHaveBeenCalledOnce();
      expect(updateTableSpy).toHaveBeenCalledWith(
        table,
        expect.arrayContaining([updatedEntity, dataH, dataZ]),
      );
    });

    it('should update an entity by non-id column', async () => {
      const updatedEntity: TestEntity = {
        ...dataH,
        value: 'completely-new',
        priority: 555,
      };

      const result = await provider.update('value', dataH.value, updatedEntity);

      expect(result).toEqual(updatedEntity);
    });

    it('should create a new entity if no match found', async () => {
      const createSpy = vi
        .spyOn(provider, 'create')
        .mockResolvedValue({ id: 'new', value: 'created', priority: 0 });
      const newEntity: TestEntity = {
        id: 'new',
        value: 'created',
        priority: 0,
      };

      const result = await provider.update('id', 'nonexistent-id', newEntity);

      expect(createSpy).toHaveBeenCalledWith(newEntity);
      expect(result).toEqual(newEntity);
    });

    it('should replace the entire entity with new value', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');
      const completelyNewEntity: TestEntity = {
        id: dataA.id,
        value: 'completely-different',
        priority: 0,
      };

      const result = await provider.update('id', dataA.id, completelyNewEntity);

      expect(result).toEqual(completelyNewEntity);
      const updateCall = updateTableSpy.mock.calls[0][1];
      expect(updateCall).toEqual([dataZ, completelyNewEntity, dataH]);
    });

    it('should handle updates to different columns', async () => {
      const updatedEntity: TestEntity = {
        ...dataZ,
        priority: 500,
      };

      const result = await provider.update(
        'priority',
        dataZ.priority,
        updatedEntity,
      );

      expect(result.priority).toBe(500);
      expect(result.id).toBe(dataZ.id);
    });
  });

  describe('deleteOne', () => {
    it('should delete an entity by id', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');

      const result = await provider.deleteOne('id', dataA.id);

      expect(result).toBe(true);
      expect(updateTableSpy).toHaveBeenCalledOnce();
      expect(updateTableSpy).toHaveBeenCalledWith(
        table,
        expect.not.arrayContaining([dataA]),
      );
    });

    it('should delete an entity by non-id column', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');

      const result = await provider.deleteOne('value', dataH.value);

      expect(result).toBe(true);
      const updateCall = updateTableSpy.mock.calls[0][1];
      expect(updateCall).toEqual([dataZ, dataA]);
    });

    it('should return true even if entity not found', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');
      const result = await provider.deleteOne('id', 'nonexistent-id');

      expect(result).toBe(true);
      expect(updateTableSpy).not.toHaveBeenCalled();
    });

    it('should delete only the matching entity', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');

      await provider.deleteOne('id', dataZ.id);

      const updateCall = updateTableSpy.mock.calls[0][1];
      expect(updateCall).toHaveLength(2);
      expect(updateCall).toEqual([dataA, dataH]);
    });

    it('should handle deletion with non-string column match', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');

      await provider.deleteOne('priority', 25);

      const updateCall = updateTableSpy.mock.calls[0][1];
      expect(updateCall).not.toEqual(expect.arrayContaining([dataH]));
    });
  });

  describe('replaceRecord', () => {
    it('should replace matching record', async () => {
      const updateTableSpy = vi.spyOn(databaseMock, 'updateTable');
      const newValue = 'test-123';
      const dataToReplace: TestEntity = {
        ...dataA,
        value: newValue,
      };
      const result = await provider.replaceRecord(dataToReplace);

      expect(updateTableSpy).toHaveBeenCalled();
      expect(result).toEqual(dataToReplace);
    });

    it('should return error if there is no matching record to replace', async () => {
      const dataToReplace: TestEntity = {
        id: 'nonexistent-id',
        value: 'no-match',
        priority: 0,
      };

      expect(provider.replaceRecord(dataToReplace)).rejects.toThrowError();
    });
  });
});
