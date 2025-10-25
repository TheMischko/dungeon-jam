import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockElectron } from '../testing/mocks/mock-electron';
import {
  mockDatabase,
  mockDatabaseInstance,
} from '../testing/mocks/mock-database';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';
import { PlaylistChannel } from '@shared/models/channels.model';
import { PlaylistManager } from './playlist.manager';
import { mockPlaylist } from '../testing/mocks/mock-playlist.data';
import { SortDirection } from '@shared/models/common.model';

vi.mock('electron', () => mockElectron);
vi.mock('./../database/database', () => mockDatabase);

describe('PlaylistManager', () => {
  let playlistManager: PlaylistManager;

  beforeEach(async () => {
    setupTestEnvironment();
    PlaylistManager.__resetForTests();
    playlistManager = await PlaylistManager.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the same instance on multiple calls', async () => {
    const instanceA = await PlaylistManager.getInstance();
    const instanceB = await PlaylistManager.getInstance();
    expect(instanceA).toBe(instanceB);
  });

  it('should respond to GET_ALL message with all playlists', async () => {
    vi.spyOn(playlistManager, 'getAll').mockReturnValue([]);

    await triggerIpcMainHandle(PlaylistChannel.GET_ALL);

    expect(playlistManager.getAll).toHaveBeenCalled();
  });

  describe('getAll', () => {
    it('should read database table and return all playlists', () => {
      const dataSet = [mockPlaylist(), mockPlaylist(), mockPlaylist()];
      mockDatabaseInstance.readTable.mockImplementation(() => dataSet);

      const result = playlistManager.getAll();

      expect(mockDatabaseInstance.readTable).toHaveBeenCalledWith('playlists');
      expect(result).toEqual(dataSet);
    });

    it('should filter playlists by name', () => {
      const testFilter = 'Favorites';
      const dataSet = [
        mockPlaylist({ name: 'My Favorites' }),
        mockPlaylist({ name: 'Workout Mix' }),
        mockPlaylist({ name: 'Favorites Hits' }),
      ];
      mockDatabaseInstance.readTable.mockImplementation(() => dataSet);

      const result = playlistManager.getAll({ filter: testFilter });

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('My Favorites');
      expect(result[1].name).toBe('Favorites Hits');
    });

    it('should filter playlists by tags', () => {
      const testFilter = 'workout';
      const dataSet = [
        mockPlaylist({ name: 'Mix 1', tags: ['workout', 'energy'] }),
        mockPlaylist({ name: 'Mix 2', tags: ['chill'] }),
        mockPlaylist({ name: 'Mix 3', tags: ['workout'] }),
      ];
      mockDatabaseInstance.readTable.mockImplementation(() => dataSet);

      const result = playlistManager.getAll({ filter: testFilter });

      expect(result.length).toBe(2);
    });

    it('should sort playlists by name ascending', () => {
      const playlistA = mockPlaylist({ name: 'Apple' });
      const playlistH = mockPlaylist({ name: 'Honey' });
      const playlistZ = mockPlaylist({ name: 'Zebra' });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        playlistH,
        playlistZ,
        playlistA,
      ]);

      const result = playlistManager.getAll({
        sortDirection: SortDirection.ASC,
      });

      expect(result).toEqual([playlistA, playlistH, playlistZ]);
    });

    it('should sort playlists by order descending', () => {
      const playlist1 = mockPlaylist({ order: 1 });
      const playlist2 = mockPlaylist({ order: 2 });
      const playlist3 = mockPlaylist({ order: 3 });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        playlist1,
        playlist3,
        playlist2,
      ]);

      const result = playlistManager.getAll({
        sortBy: 'order',
        sortDirection: SortDirection.DESC,
      });

      expect(result).toEqual([playlist3, playlist2, playlist1]);
    });
  });
});
