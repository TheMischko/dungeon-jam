import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ipcMain } from 'electron';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DiscordTokenManager } from './discord-token.manager';
import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';

vi.mock('electron', async () => {
  const { mockElectron } = await import('../testing/mocks/mock-electron');
  return mockElectron;
});
vi.mock('./../database/database', async () => {
  const { mockDatabase } = await import('../testing/mocks/mock-database');
  return mockDatabase;
});
vi.mock('../database/database-provider-creator');

function mockTokenData(overrides?: Partial<DiscordTokenData>): DiscordTokenData {
  return {
    id: 'test-id',
    apiKey: 'test-api-key',
    name: 'Test Token',
    ...overrides,
  };
}

function mockUpdateData(overrides?: Partial<DiscordTokenUpdateData>): DiscordTokenUpdateData {
  return {
    apiKey: 'test-api-key',
    name: 'Test Token',
    ...overrides,
  };
}

describe('DiscordTokenManager', () => {
  let manager: DiscordTokenManager;
  let mockTokenProvider: any;

  beforeEach(async () => {
    setupTestEnvironment();
    DiscordTokenManager.__resetForTests();

    mockTokenProvider = {
      getAll: vi.fn().mockResolvedValue([]),
      getBy: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data, id) => Promise.resolve({ ...data, id: id ?? 'generated-id' })),
      replaceRecord: vi.fn().mockImplementation((record) => Promise.resolve(record)),
      deleteOne: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(DatabaseProviderCreator.create).mockReturnValue({
      setTable: vi.fn().mockReturnThis(),
      setIdColumn: vi.fn().mockReturnThis(),
      complete: vi.fn().mockResolvedValue(mockTokenProvider as DatabaseProvider<DiscordTokenData>),
    } as any);

    manager = await DiscordTokenManager.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', async () => {
      const instanceA = await DiscordTokenManager.getInstance();
      const instanceB = await DiscordTokenManager.getInstance();
      expect(instanceA).toBe(instanceB);
    });

    it('should register all IPC channels on getInstance', () => {
      const channels = [
        DiscordTokenChannel.CREATE,
        DiscordTokenChannel.UPDATE,
        DiscordTokenChannel.GET_ALL,
        DiscordTokenChannel.DELETE,
      ];

      channels.forEach((channel) => {
        expect(vi.mocked(ipcMain.handle)).toHaveBeenCalledWith(
          channel,
          expect.any(Function),
        );
      });
    });

    it('should configure the database provider with correct table and id column', () => {
      const builderMock = vi.mocked(DatabaseProviderCreator.create).mock.results[0].value;
      expect(builderMock.setTable).toHaveBeenCalledWith('discordTokens');
      expect(builderMock.setIdColumn).toHaveBeenCalledWith('id');
    });
  });

  describe('saveToken', () => {
    it('should create a new token when no existing record is found', async () => {
      const data = mockUpdateData();
      const created = mockTokenData();
      mockTokenProvider.getBy.mockResolvedValue(null);
      mockTokenProvider.create.mockResolvedValue(created);

      const result = await manager.saveToken(data);

      expect(mockTokenProvider.getBy).toHaveBeenCalledWith('id', undefined);
      expect(mockTokenProvider.create).toHaveBeenCalledWith(data, undefined);
      expect(result).toEqual(created);
    });

    it('should update an existing token via replaceRecord when a record is found', async () => {
      const existing = mockTokenData();
      const data = mockUpdateData({ name: 'Updated Name' });
      const expected = { ...existing, ...data };
      mockTokenProvider.getBy.mockResolvedValue(existing);
      mockTokenProvider.replaceRecord.mockResolvedValue(expected);

      const result = await manager.saveToken(data, 'test-id');

      expect(mockTokenProvider.getBy).toHaveBeenCalledWith('id', 'test-id');
      expect(mockTokenProvider.replaceRecord).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });

    it('should propagate errors from the database on create', async () => {
      const data = mockUpdateData();
      mockTokenProvider.getBy.mockResolvedValue(null);
      mockTokenProvider.create.mockRejectedValue(new Error('DB write failed'));

      await expect(manager.saveToken(data)).rejects.toThrow('DB write failed');
    });

    it('should propagate errors from the database on replaceRecord', async () => {
      const existing = mockTokenData();
      mockTokenProvider.getBy.mockResolvedValue(existing);
      mockTokenProvider.replaceRecord.mockRejectedValue(new Error('DB replace failed'));

      await expect(manager.saveToken(mockUpdateData(), 'test-id')).rejects.toThrow('DB replace failed');
    });
  });

  describe('getTokens', () => {
    it('should return all tokens from the database', async () => {
      const tokens = [mockTokenData({ id: 'id-1', apiKey: 'key-1' }), mockTokenData({ id: 'id-2', apiKey: 'key-2' })];
      mockTokenProvider.getAll.mockResolvedValue(tokens);

      const result = await manager.getTokens();

      expect(mockTokenProvider.getAll).toHaveBeenCalled();
      expect(result).toEqual(tokens);
    });

    it('should return an empty array when no tokens exist', async () => {
      mockTokenProvider.getAll.mockResolvedValue([]);

      const result = await manager.getTokens();

      expect(result).toEqual([]);
    });

    it('should propagate errors from the database', async () => {
      const dbError = new Error('DB read failed');
      mockTokenProvider.getAll.mockRejectedValue(dbError);

      await expect(manager.getTokens()).rejects.toThrow('DB read failed');
    });
  });

  describe('deleteToken', () => {
    it('should delete a token by id and return true', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(true);

      const result = await manager.deleteToken('test-id');

      expect(mockTokenProvider.deleteOne).toHaveBeenCalledWith('id', 'test-id');
      expect(result).toBe(true);
    });

    it('should return false when no token was found to delete', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(false);

      const result = await manager.deleteToken('nonexistent-id');

      expect(result).toBe(false);
    });

    it('should propagate errors from the database', async () => {
      const dbError = new Error('DB delete failed');
      mockTokenProvider.deleteOne.mockRejectedValue(dbError);

      await expect(manager.deleteToken('test-id')).rejects.toThrow('DB delete failed');
    });
  });

  describe('IPC Handlers', () => {
    it('should handle CREATE through IPC and return a new token', async () => {
      const data = mockUpdateData();
      const created = mockTokenData();
      mockTokenProvider.getBy.mockResolvedValue(null);
      mockTokenProvider.create.mockResolvedValue(created);

      const result = await triggerIpcMainHandle<DiscordTokenData>(
        DiscordTokenChannel.CREATE,
        data,
      );

      expect(mockTokenProvider.create).toHaveBeenCalledWith(data, undefined);
      expect(result).toEqual(created);
    });

    it('should handle UPDATE through IPC using { id, newData } payload and return updated token', async () => {
      const existing = mockTokenData();
      const newData = mockUpdateData({ name: 'Updated Name' });
      const expected = { ...existing, ...newData };
      mockTokenProvider.getBy.mockResolvedValue(existing);
      mockTokenProvider.replaceRecord.mockResolvedValue(expected);

      const result = await triggerIpcMainHandle<DiscordTokenData>(
        DiscordTokenChannel.UPDATE,
        { id: 'test-id', newData },
      );

      expect(mockTokenProvider.getBy).toHaveBeenCalledWith('id', 'test-id');
      expect(mockTokenProvider.replaceRecord).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });

    it('should handle GET_ALL through IPC and return all tokens', async () => {
      const tokens = [
        mockTokenData({ id: 'id-1', apiKey: 'key-1', name: 'Token 1' }),
        mockTokenData({ id: 'id-2', apiKey: 'key-2', name: 'Token 2' }),
      ];
      mockTokenProvider.getAll.mockResolvedValue(tokens);

      const result = await triggerIpcMainHandle<DiscordTokenData[]>(
        DiscordTokenChannel.GET_ALL,
      );

      expect(mockTokenProvider.getAll).toHaveBeenCalled();
      expect(result).toEqual(tokens);
    });

    it('should handle DELETE through IPC and return true on success', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(true);

      const result = await triggerIpcMainHandle<boolean>(
        DiscordTokenChannel.DELETE,
        'test-id',
      );

      expect(mockTokenProvider.deleteOne).toHaveBeenCalledWith('id', 'test-id');
      expect(result).toBe(true);
    });

    it('should handle DELETE through IPC and return false when id not found', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(false);

      const result = await triggerIpcMainHandle<boolean>(
        DiscordTokenChannel.DELETE,
        'nonexistent-id',
      );

      expect(result).toBe(false);
    });
  });
});
