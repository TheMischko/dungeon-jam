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
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { Playlist } from '@shared/models/playlist.model';

vi.mock('electron', () => mockElectron);
vi.mock('./../database/database', () => mockDatabase);
vi.mock('../database/database-provider-creator');

describe('PlaylistManager', () => {
  let playlistManager: PlaylistManager;
  let mockPlaylistProvider: any;

  beforeEach(async () => {
    setupTestEnvironment();
    PlaylistManager.__resetForTests();

    mockPlaylistProvider = {
      getAll: vi.fn().mockResolvedValue([]),
      getBy: vi.fn().mockResolvedValue(null),
      getById: vi.fn().mockResolvedValue(null),
      getSome: vi.fn().mockResolvedValue([]),
      create: vi
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ ...data, id: data.id || 'generated-id' }),
        ),
      replaceRecord: vi
        .fn()
        .mockImplementation((data) => Promise.resolve(data)),
    };

    vi.mocked(DatabaseProviderCreator.create).mockReturnValue({
      setTable: vi.fn().mockReturnThis(),
      setSort: vi.fn().mockReturnThis(),
      setFilter: vi.fn().mockReturnThis(),
      complete: vi
        .fn()
        .mockResolvedValue(mockPlaylistProvider as DatabaseProvider<Playlist>),
    } as any);

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

  it('should register all IPC channels on getInstance', async () => {
    const channels = [
      PlaylistChannel.GET_ALL,
      PlaylistChannel.GET_BY_ID,
      PlaylistChannel.INSERT,
      PlaylistChannel.ADD_TRACKS,
      PlaylistChannel.UPDATE,
    ];

    channels.forEach((channel) => {
      expect(vi.mocked(mockElectron.ipcMain.handle)).toHaveBeenCalledWith(
        channel,
        expect.any(Function),
      );
    });
  });

  describe('IPC Handlers', () => {
    it('should handle GET_ALL through IPC with filter and sort', async () => {
      const playlists = [mockPlaylist(), mockPlaylist()];
      mockPlaylistProvider.getAll.mockResolvedValue(playlists);

      const result = (await triggerIpcMainHandle(PlaylistChannel.GET_ALL, {
        filter: 'test',
        sortBy: 'name',
        sortDirection: SortDirection.ASC,
      })) as Playlist[];

      expect(mockPlaylistProvider.getAll).toHaveBeenCalledWith({
        filter: 'test',
        sortBy: 'name',
        sortDirection: SortDirection.ASC,
      });
      expect(result).toEqual(playlists);
    });

    it('should handle GET_BY_ID through IPC', async () => {
      const playlist = mockPlaylist({ id: 'playlist-123' });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);

      const result = (await triggerIpcMainHandle(
        PlaylistChannel.GET_BY_ID,
        'playlist-123',
      )) as Playlist | null;

      expect(mockPlaylistProvider.getBy).toHaveBeenCalledWith(
        'id',
        'playlist-123',
      );
      expect(result).toEqual(playlist);
    });

    it('should handle INSERT through IPC', async () => {
      mockPlaylistProvider.getAll.mockResolvedValue([]);
      const newPlaylist = mockPlaylist({ order: 0 });
      mockPlaylistProvider.create.mockResolvedValue(newPlaylist);

      const result = (await triggerIpcMainHandle(PlaylistChannel.INSERT, {
        name: 'New Playlist',
        description: 'Test',
        imageUrl: 'http://example.com/img.jpg',
        tags: [{ id: 'tag-1', name: 'Rock' }],
      })) as Playlist;

      expect(mockPlaylistProvider.create).toHaveBeenCalled();
      const createCall = vi.mocked(mockPlaylistProvider.create).mock
        .calls[0][0];
      expect(createCall.name).toBe('New Playlist');
      expect(createCall.trackIds).toEqual([]);
      expect(createCall.order).toBe(0);
      expect(result).toEqual(newPlaylist);
    });

    it('should handle ADD_TRACKS through IPC', async () => {
      const playlist = mockPlaylist({
        id: 'playlist-1',
        trackIds: ['track-1'],
      });
      mockDatabaseInstance.readTable.mockReturnValue([playlist]);

      const result = (await triggerIpcMainHandle(PlaylistChannel.ADD_TRACKS, {
        'playlist-1': ['track-2', 'track-3'],
      })) as Map<string, Playlist>;

      expect(mockDatabaseInstance.updateTable).toHaveBeenCalledWith(
        'playlists',
        expect.any(Array),
      );
      expect(result.size).toBe(1);
      expect(result.get('playlist-1')?.trackIds).toContain('track-2');
    });

    it('should handle UPDATE through IPC', async () => {
      const playlist = mockPlaylist({
        id: 'playlist-1',
        name: 'Old Name',
        tags: ['tag-1'],
      });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);
      mockPlaylistProvider.replaceRecord.mockResolvedValue({
        ...playlist,
        name: 'New Name',
        tags: ['tag-1', 'tag-2'],
      });

      const result = (await triggerIpcMainHandle(PlaylistChannel.UPDATE, {
        id: 'playlist-1',
        name: 'New Name',
        tagsAdded: ['tag-2'],
      })) as Playlist;

      expect(result.name).toBe('New Name');
      expect(result.tags).toContain('tag-2');
    });
  });

  describe('insert', () => {
    it('should create a new playlist with order based on existing count', async () => {
      const existingPlaylists = [mockPlaylist(), mockPlaylist()];
      mockPlaylistProvider.getAll.mockResolvedValue(existingPlaylists);

      await triggerIpcMainHandle(PlaylistChannel.INSERT, {
        name: 'New Playlist',
        description: 'Test',
        tags: [],
      });

      const createCall = vi.mocked(mockPlaylistProvider.create).mock
        .calls[0][0];
      expect(createCall.name).toBe('New Playlist');
      expect(createCall.trackIds).toEqual([]);
      expect(createCall.order).toBe(2);
      expect(createCall.id).toBeDefined();
    });
  });

  describe('addTracks', () => {
    it('should add new tracks and filter duplicates', async () => {
      const playlistId = 'playlist-1';
      const playlist = mockPlaylist({
        id: playlistId,
        trackIds: ['track-1', 'track-2'],
      });
      mockDatabaseInstance.readTable.mockReturnValue([playlist]);

      const result = (await triggerIpcMainHandle(PlaylistChannel.ADD_TRACKS, {
        [playlistId]: ['track-2', 'track-3', 'track-3'],
      })) as Map<string, Playlist>;

      expect(result.get(playlistId)?.trackIds).toEqual([
        'track-1',
        'track-2',
        'track-3',
      ]);
    });

    it('should return empty Map when no playlists exist', async () => {
      mockDatabaseInstance.readTable.mockReturnValue(null);

      const result = (await triggerIpcMainHandle(PlaylistChannel.ADD_TRACKS, {
        'playlist-1': ['track-1'],
      })) as Map<string, Playlist>;

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

      const result = (await triggerIpcMainHandle(PlaylistChannel.ADD_TRACKS, {
        'playlist-1': ['track-3'],
        'playlist-2': ['track-4'],
      })) as Map<string, Playlist>;

      expect(result.size).toBe(2);
      expect(result.get('playlist-1')?.trackIds).toContain('track-3');
      expect(result.get('playlist-2')?.trackIds).toContain('track-4');
    });
  });

  describe('update', () => {
    it('should update playlist with name, tags, and tracks', async () => {
      const playlist = mockPlaylist({
        id: 'playlist-1',
        name: 'Old Name',
        tags: ['tag-1', 'tag-2'],
        trackIds: ['track-1', 'track-2'],
      });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);
      mockPlaylistProvider.replaceRecord.mockResolvedValue({
        ...playlist,
        name: 'New Name',
        tags: ['tag-1', 'tag-3'],
        trackIds: ['track-1', 'track-3'],
      });

      const result = (await triggerIpcMainHandle(PlaylistChannel.UPDATE, {
        id: 'playlist-1',
        name: 'New Name',
        tagsAdded: ['tag-3'],
        tagsRemoved: ['tag-2'],
        tracksAdded: ['track-3'],
        tracksRemoved: ['track-2'],
      })) as Playlist;

      expect(result.name).toBe('New Name');
      expect(result.tags).toContain('tag-1');
      expect(result.tags).toContain('tag-3');
      expect(result.trackIds).toContain('track-1');
      expect(result.trackIds).toContain('track-3');
    });

    it('should throw error when playlist ID is missing', async () => {
      await expect(
        triggerIpcMainHandle(PlaylistChannel.UPDATE, {
          name: 'New Name',
        }),
      ).rejects.toThrow('Playlist ID is required for update.');
    });

    it('should throw error when playlist not found', async () => {
      mockPlaylistProvider.getBy.mockResolvedValue(null);

      await expect(
        triggerIpcMainHandle(PlaylistChannel.UPDATE, {
          id: 'nonexistent-id',
          name: 'New Name',
        }),
      ).rejects.toThrow('Playlist with ID nonexistent-id not found');
    });

    it('should preserve unmodified fields', async () => {
      const playlist = mockPlaylist({
        id: 'playlist-1',
        name: 'Original Name',
        description: 'Original Description',
        order: 5,
      });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);
      mockPlaylistProvider.replaceRecord.mockResolvedValue({
        ...playlist,
        name: 'Updated Name',
      });

      const result = (await triggerIpcMainHandle(PlaylistChannel.UPDATE, {
        id: 'playlist-1',
        name: 'Updated Name',
      })) as Playlist;

      expect(result.order).toBe(5);
      expect(result.description).toBe('Original Description');
    });
  });

  describe('filterPlaylists', () => {
    it('should return true when no filter provided', () => {
      const playlist = mockPlaylist();
      expect(PlaylistManager['filterPlaylists'](playlist)).toBe(true);
    });

    it('should filter by playlist name and tags case-insensitively', () => {
      const playlist = mockPlaylist({
        name: 'My Favorites',
        tags: ['ROCK', 'ENERGY'],
      });

      expect(PlaylistManager['filterPlaylists'](playlist, 'favorites')).toBe(
        true,
      );
      expect(PlaylistManager['filterPlaylists'](playlist, 'rock')).toBe(true);
      expect(PlaylistManager['filterPlaylists'](playlist, 'jazz')).toBe(false);
    });
  });

  describe('sortPlaylists', () => {
    it('should return 0 when no sort direction provided', () => {
      const playlistA = mockPlaylist();
      const playlistB = mockPlaylist();
      expect(PlaylistManager['sortPlaylists'](playlistA, playlistB)).toBe(0);
    });

    it('should sort by name and order ascending/descending', () => {
      const playlistA = mockPlaylist({ name: 'Apple', order: 1 });
      const playlistZ = mockPlaylist({ name: 'Zebra', order: 3 });

      // Name ascending
      expect(
        PlaylistManager['sortPlaylists'](
          playlistZ,
          playlistA,
          SortDirection.ASC,
          'name',
        ),
      ).toBeGreaterThan(0);

      // Order descending
      expect(
        PlaylistManager['sortPlaylists'](
          playlistZ,
          playlistA,
          SortDirection.DESC,
          'order',
        ),
      ).toBeLessThan(0);
    });
  });

  describe('isTrackInPlaylist', () => {
    it('should return true if the track is in the playlist', async () => {
      const trackId = 'track-123';
      const playlist = mockPlaylist({
        trackIds: [trackId],
      });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);

      const result = await playlistManager.isTrackInPlaylist(
        trackId,
        playlist.id,
      );

      expect(result).toBe(true);
    });

    it('should return false if the track is not in the playlist', async () => {
      const trackId = 'track-123';
      const playlist = mockPlaylist({
        trackIds: ['track-1234'],
      });
      mockPlaylistProvider.getBy.mockResolvedValue(playlist);

      const result = await playlistManager.isTrackInPlaylist(
        trackId,
        playlist.id,
      );

      expect(result).toBe(false);
    });
  });

  describe('isTrackInPlaylists', () => {
    it('should use isTrackInPlaylist for single playlist ID', async () => {
      const trackId = 'track-123';
      const playlist = mockPlaylist({
        trackIds: ['track-1234'],
      });
      vi.spyOn(playlistManager, 'isTrackInPlaylist').mockResolvedValue(true);

      const result = await playlistManager.isTrackInPlaylists(trackId, [
        playlist.id,
      ]);

      expect(playlistManager.isTrackInPlaylist).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true if track is found in one of the playlists', async () => {
      const trackId = 'track-123';
      const playlists: Playlist[] = [
        mockPlaylist(),
        mockPlaylist({
          trackIds: ['rack-123', 'track-1234'],
        }),
        mockPlaylist({
          trackIds: [trackId],
        }),
        mockPlaylist(),
      ];

      mockPlaylistProvider.getSome.mockResolvedValue(playlists);
      const result = await playlistManager.isTrackInPlaylists(
        trackId,
        playlists.map((p) => p.id),
      );

      expect(result).toBe(true);
    });

    it('should return false if track is not found in any playlists', async () => {
      const trackId = 'track-123';
      const playlists: Playlist[] = [
        mockPlaylist({
          trackIds: ['rack-125', 'track-1254'],
        }),
        mockPlaylist({
          trackIds: ['rack-123', 'track-1234'],
        }),
        mockPlaylist({
          trackIds: ['rack-125', 'track-1254'],
        }),
        mockPlaylist(),
      ];

      mockPlaylistProvider.getSome.mockResolvedValue(playlists);
      const result = await playlistManager.isTrackInPlaylists(
        trackId,
        playlists.map((p) => p.id),
      );

      expect(result).toBe(false);
    });
  });
});
