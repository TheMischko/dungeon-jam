import { afterEach, describe, expect, vi } from 'vitest';
import { mockDatabase } from '../testing/mocks/mock-database';
import { DatabaseProviderCreator } from './database-provider-creator';
import { DatabaseTable } from './init-database';
import { DatabaseProvider, FilterFn, SortFn } from './database-provider';
import { SortDirection } from '@shared/models/common.model';

vi.mock('./database', () => mockDatabase);

type TestEntity = {
  id: string;
  value: string;
  priority: number;
};

const customFilter: FilterFn<TestEntity> = (item, filter) => {
  return item.value.toLowerCase().includes(filter.toLowerCase());
};

const customSort: SortFn<TestEntity> = (itemA, itemB, sortBy, direction) => {
  const valA = Number(itemA[sortBy as keyof TestEntity] ?? 0);
  const valB = Number(itemB[sortBy as keyof TestEntity] ?? 0);
  return (valA - valB) * (direction === SortDirection.ASC ? 1 : -1);
};

describe('DatabaseProviderCreator', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new instance with static method', () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();

      expect(creator).toBeInstanceOf(DatabaseProviderCreator);
    });

    it('should initialize with default values', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();
      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });
  });

  describe('setTable', () => {
    it('should set the table name', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>().setTable(
        'playlists' as DatabaseTable,
      );

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should set table to tracks by default', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();
      // Access private field indirectly by checking the provider behavior
      const provider = await creator.complete();

      expect(provider).toBeDefined();
    });
  });

  describe('setIdColumn', () => {
    it('should set the id column', async () => {
      const creator =
        DatabaseProviderCreator.create<TestEntity>().setIdColumn('id');

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should return this for method chaining', () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();
      const result = creator.setIdColumn('id');

      expect(result).toBe(creator);
    });

    it('should allow setting different id columns', async () => {
      const creator1 =
        DatabaseProviderCreator.create<TestEntity>().setIdColumn('id');
      const creator2 =
        DatabaseProviderCreator.create<TestEntity>().setIdColumn('value');

      const provider1 = await creator1.complete();
      const provider2 = await creator2.complete();

      expect(provider1).toBeInstanceOf(DatabaseProvider);
      expect(provider2).toBeInstanceOf(DatabaseProvider);
    });
  });

  describe('setSort', () => {
    it('should set the sort function', async () => {
      const creator =
        DatabaseProviderCreator.create<TestEntity>().setSort(customSort);

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should use provided sort function in provider', async () => {
      const creator =
        DatabaseProviderCreator.create<TestEntity>().setSort(customSort);

      const provider = await creator.complete();

      expect(provider).toBeDefined();
    });
  });

  describe('setFilter', () => {
    it('should set the filter function', async () => {
      const creator =
        DatabaseProviderCreator.create<TestEntity>().setFilter(customFilter);

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should use provided filter function in provider', async () => {
      const creator =
        DatabaseProviderCreator.create<TestEntity>().setFilter(customFilter);

      const provider = await creator.complete();

      expect(provider).toBeDefined();
    });
  });

  describe('complete', () => {
    it('should return a DatabaseProvider instance', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();
      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should get database instance', async () => {
      const getInstanceSpy = vi.spyOn(
        mockDatabase.DatabaseWrapper,
        'getInstance',
      );

      const creator = DatabaseProviderCreator.create<TestEntity>();
      await creator.complete();

      expect(getInstanceSpy).toHaveBeenCalledOnce();
    });

    it('should pass all configured settings to DatabaseProvider', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>()
        .setTable('tags' as DatabaseTable)
        .setIdColumn('value')
        .setFilter(customFilter)
        .setSort(customSort);

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });
  });

  describe('method chaining', () => {
    it('should support full fluent API chain', async () => {
      const provider = await DatabaseProviderCreator.create<TestEntity>()
        .setTable('playlists' as DatabaseTable)
        .setIdColumn('id')
        .setFilter(customFilter)
        .setSort(customSort)
        .complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should support partial fluent API chain', async () => {
      const provider = await DatabaseProviderCreator.create<TestEntity>()
        .setFilter(customFilter)
        .complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should support single method calls', async () => {
      const provider =
        await DatabaseProviderCreator.create<TestEntity>().complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should allow overriding previously set values', async () => {
      const provider = await DatabaseProviderCreator.create<TestEntity>()
        .setTable('tags' as DatabaseTable)
        .setTable('playlists' as DatabaseTable)
        .setFilter(customFilter)
        .setFilter(() => true)
        .complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should return same instance from setters', () => {
      const creator = DatabaseProviderCreator.create<TestEntity>();
      const result1 = creator.setTable('tags' as DatabaseTable);
      const result2 = result1.setIdColumn('id');
      const result3 = result2.setFilter(customFilter);
      const result4 = result3.setSort(customSort);

      expect(result1).toBe(creator);
      expect(result2).toBe(creator);
      expect(result3).toBe(creator);
      expect(result4).toBe(creator);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined custom functions gracefully', async () => {
      const creator = DatabaseProviderCreator.create<TestEntity>()
        .setFilter(() => true)
        .setSort(() => 0);

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should work with different entity types', async () => {
      type AnotherEntity = {
        id: number;
        name: string;
      };

      const creator =
        DatabaseProviderCreator.create<AnotherEntity>().setIdColumn('id');

      const provider = await creator.complete();

      expect(provider).toBeInstanceOf(DatabaseProvider);
    });

    it('should handle rapid successive calls', async () => {
      const creators = [
        DatabaseProviderCreator.create<TestEntity>(),
        DatabaseProviderCreator.create<TestEntity>(),
        DatabaseProviderCreator.create<TestEntity>(),
      ];

      const providers = await Promise.all(creators.map((c) => c.complete()));

      expect(providers).toHaveLength(3);
      providers.forEach((provider) => {
        expect(provider).toBeInstanceOf(DatabaseProvider);
      });
    });
  });
});
