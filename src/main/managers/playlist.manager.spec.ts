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

  it('should respond to GET_BY_ID message with the matching playlist', async () => {
    const testId = 'playlist-123';
    const playlist = mockPlaylist({ id: testId });
    vi.spyOn(playlistManager, 'getById').mockReturnValue(playlist);

    await triggerIpcMainHandle(PlaylistChannel.GET_BY_ID, testId);

    expect(playlistManager.getById).toHaveBeenCalledWith(testId);
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

  describe('getById', () => {
    it('should return the playlist when it exists', () => {
      const targetPlaylist = mockPlaylist({ id: 'playlist-123' });
      const otherPlaylist1 = mockPlaylist({ id: 'playlist-456' });
      const otherPlaylist2 = mockPlaylist({ id: 'playlist-789' });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        otherPlaylist1,
        targetPlaylist,
        otherPlaylist2,
      ]);

      const result = playlistManager.getById('playlist-123');

      expect(result).toEqual(targetPlaylist);
    });

    it('should return null when playlist does not exist', () => {
      const playlist1 = mockPlaylist({ id: 'playlist-123' });
      const playlist2 = mockPlaylist({ id: 'playlist-456' });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        playlist1,
        playlist2,
      ]);

      const result = playlistManager.getById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should return null when no playlists exist in database', () => {
      mockDatabaseInstance.readTable.mockImplementation(() => null);

      const result = playlistManager.getById('any-id');

      expect(result).toBeNull();
    });
  });

  describe('addTracks', () => {
    it('should add new tracks to playlist', async () => {
      const playlistId = 'playlist-1';
      const existingTrackIds = ['track-1', 'track-2'];
      const newTrackIds = ['track-3', 'track-4'];
      const playlist = mockPlaylist({
        id: playlistId,
        trackIds: existingTrackIds,
      });

      mockDatabaseInstance.readTable.mockReturnValue([playlist]);

      const result = await playlistManager['addTracks']({
        [playlistId]: newTrackIds,
      });

      expect(mockDatabaseInstance.updateTable).toHaveBeenCalledWith(
        'playlists',
        expect.arrayContaining([
          expect.objectContaining({
            id: playlistId,
            trackIds: [...existingTrackIds, ...newTrackIds],
          }),
        ]),
      );
      expect(result.size).toBe(1);
      expect(result.get(playlistId)?.trackIds).toEqual([
        ...existingTrackIds,
        ...newTrackIds,
      ]);
    });

    it('should filter out duplicate tracks', async () => {
      const playlistId = 'playlist-1';
      const existingTrackIds = ['track-1', 'track-2'];
      const tracksToAdd = ['track-2', 'track-3', 'track-3'];
      const playlist = mockPlaylist({
        id: playlistId,
        trackIds: existingTrackIds,
      });

      mockDatabaseInstance.readTable.mockReturnValue([playlist]);

      const result = await playlistManager['addTracks']({
        [playlistId]: tracksToAdd,
      });

      expect(result.get(playlistId)?.trackIds).toEqual([
        'track-1',
        'track-2',
        'track-3',
      ]);
    });

    it('should return empty Map when no playlists exist', async () => {
      mockDatabaseInstance.readTable.mockReturnValue(null);

      const result = await playlistManager['addTracks']({
        'playlist-1': ['track-1'],
      });

      expect(result.size).toBe(0);
    });

    it('should not modify playlists that are not in the update data', async () => {
      const playlist1 = mockPlaylist({
        id: 'playlist-1',
        trackIds: ['track-1'],
      });
      const playlist2 = mockPlaylist({
        id: 'playlist-2',
        trackIds: ['track-2'],
      });

      mockDatabaseInstance.readTable.mockReturnValue([playlist1, playlist2]);

      const result = await playlistManager['addTracks']({
        'playlist-1': ['track-3'],
      });

      expect(result.size).toBe(1);
      expect(result.has('playlist-1')).toBe(true);
      expect(result.has('playlist-2')).toBe(false);
    });

    it('should not modify playlist when no new tracks to add', async () => {
      const playlistId = 'playlist-1';
      const existingTrackIds = ['track-1', 'track-2'];
      const playlist = mockPlaylist({
        id: playlistId,
        trackIds: existingTrackIds,
      });

      mockDatabaseInstance.readTable.mockReturnValue([playlist]);

      const result = await playlistManager['addTracks']({
        [playlistId]: ['track-1', 'track-2'],
      });

      expect(result.size).toBe(0);
    });

    it('should handle multiple playlists in one operation', async () => {
      const playlist1 = mockPlaylist({
        id: 'playlist-1',
        trackIds: ['track-1'],
      });
      const playlist2 = mockPlaylist({
        id: 'playlist-2',
        trackIds: ['track-2'],
      });

      mockDatabaseInstance.readTable.mockReturnValue([playlist1, playlist2]);

      const result = await playlistManager['addTracks']({
        'playlist-1': ['track-3'],
        'playlist-2': ['track-4'],
      });

      expect(result.size).toBe(2);
      expect(result.get('playlist-1')?.trackIds).toContain('track-3');
      expect(result.get('playlist-2')?.trackIds).toContain('track-4');
    });
  });
});
