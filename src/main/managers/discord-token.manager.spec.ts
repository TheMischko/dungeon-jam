import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ipcMain } from 'electron';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DiscordTokenManager } from './discord-token.manager';
import { DiscordTokenData } from '@shared/models/discord.model';
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
      update: vi.fn().mockImplementation((_, __, data) => Promise.resolve(data)),
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
      expect(builderMock.setIdColumn).toHaveBeenCalledWith('apiKey');
    });
  });

  describe('saveToken', () => {
    it('should update and return the token data', async () => {
      const token = mockTokenData();
      mockTokenProvider.update.mockResolvedValue(token);

      const result = await manager.saveToken(token);

      expect(mockTokenProvider.update).toHaveBeenCalledWith('apiKey', token.apiKey, token);
      expect(result).toEqual(token);
    });

    it('should propagate errors from the database', async () => {
      const token = mockTokenData();
      const dbError = new Error('DB write failed');
      mockTokenProvider.update.mockRejectedValue(dbError);

      expect(manager.saveToken(token)).rejects.toThrow('DB write failed');
    });
  });

  describe('getTokens', () => {
    it('should return all tokens from the database', async () => {
      const tokens = [mockTokenData({ apiKey: 'key-1' }), mockTokenData({ apiKey: 'key-2' })];
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

      expect(manager.getTokens()).rejects.toThrow('DB read failed');
    });
  });

  describe('deleteToken', () => {
    it('should delete a token by apiKey and return true', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(true);

      const result = await manager.deleteToken('test-api-key');

      expect(mockTokenProvider.deleteOne).toHaveBeenCalledWith('apiKey', 'test-api-key');
      expect(result).toBe(true);
    });

    it('should return false when no token was found to delete', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(false);

      const result = await manager.deleteToken('nonexistent-key');

      expect(result).toBe(false);
    });

    it('should propagate errors from the database', async () => {
      const dbError = new Error('DB delete failed');
      mockTokenProvider.deleteOne.mockRejectedValue(dbError);

      expect(manager.deleteToken('test-api-key')).rejects.toThrow('DB delete failed');
    });
  });

  describe('IPC Handlers', () => {
    it('should handle CREATE through IPC and return saved token', async () => {
      const token = mockTokenData();
      mockTokenProvider.update.mockResolvedValue(token);

      const result = await triggerIpcMainHandle<DiscordTokenData>(
        DiscordTokenChannel.CREATE,
        token,
      );

      expect(mockTokenProvider.update).toHaveBeenCalledWith('apiKey', token.apiKey, token);
      expect(result).toEqual(token);
    });

    it('should handle UPDATE through IPC and return updated token', async () => {
      const token = mockTokenData({ name: 'Updated Name' });
      mockTokenProvider.update.mockResolvedValue(token);

      const result = await triggerIpcMainHandle<DiscordTokenData>(
        DiscordTokenChannel.UPDATE,
        token,
      );

      expect(mockTokenProvider.update).toHaveBeenCalledWith('apiKey', token.apiKey, token);
      expect(result).toEqual(token);
    });

    it('should handle GET_ALL through IPC and return all tokens', async () => {
      const tokens = [
        mockTokenData({ apiKey: 'key-1', name: 'Token 1' }),
        mockTokenData({ apiKey: 'key-2', name: 'Token 2' }),
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
        'test-api-key',
      );

      expect(mockTokenProvider.deleteOne).toHaveBeenCalledWith('apiKey', 'test-api-key');
      expect(result).toBe(true);
    });

    it('should handle DELETE through IPC and return false when key not found', async () => {
      mockTokenProvider.deleteOne.mockResolvedValue(false);

      const result = await triggerIpcMainHandle<boolean>(
        DiscordTokenChannel.DELETE,
        'nonexistent-key',
      );

      expect(result).toBe(false);
    });
  });
});
