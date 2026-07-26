import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { mockElectron } from '../testing/mocks/mock-electron';
import {
  mockDatabase,
  mockDatabaseInstance,
} from '../testing/mocks/mock-database';
import { setupTestEnvironment } from '../testing/setup';
import { TagsManager } from './tags.manager';
import { mockTrack } from '../testing/mocks/mock-track.data';
import { mockTagData } from '../testing/mocks/mock-tag';
import { mockPlaylist } from '../testing/mocks/mock-playlist.data';

vi.mock('electron', () => mockElectron);
vi.mock('./../database/database', () => mockDatabase);

describe('TagsManager', () => {
  let manager: TagsManager;

  beforeEach(async () => {
    setupTestEnvironment();
    manager = await TagsManager.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('clearOrphanedTags', () => {
    const tagAUsed = mockTagData();
    const tagBUnused = mockTagData();
    const tagCUsed = mockTagData();
    const tagDUnused = mockTagData();
    const tagEUsed = mockTagData();
    const tagFUnused = mockTagData();

    const tags = [
      tagAUsed,
      tagBUnused,
      tagCUsed,
      tagDUnused,
      tagEUsed,
      tagFUnused,
    ];

    const tracks = [
      mockTrack({ tags: [] }),
      mockTrack({ tags: [tagAUsed.id, tagCUsed.id] }),
      mockTrack({ tags: [tagAUsed.id] }),
    ];

    const playlists = [
      mockPlaylist({ tags: [tagCUsed.id] }),
      mockPlaylist({ tags: undefined }),
      mockPlaylist({ tags: [tagEUsed.id, tagAUsed.id] }),
    ];

    const readTableMockFn = (tableName: string) => {
      switch (tableName) {
        case 'tags':
          return tags;
        case 'tracks':
          return tracks;
        case 'playlists':
          return playlists;
        default:
          return [];
      }
    };

    it('should load tags from playlists and tracks', async () => {
      vi.spyOn(mockDatabaseInstance, 'readTable').mockImplementation(
        (tableName) => {
          return readTableMockFn(tableName);
        },
      );

      await manager.clearOrphanedTags();
      expect(mockDatabaseInstance.readTable).toHaveBeenCalledWith('tracks');
      expect(mockDatabaseInstance.readTable).toHaveBeenCalledWith('playlists');
    });

    it('should remove unused tags', async () => {
      vi.spyOn(mockDatabaseInstance, 'readTable').mockImplementation(
        (tableName) => {
          return readTableMockFn(tableName);
        },
      );
      const deleteSpy = vi.spyOn(manager, 'delete').mockResolvedValue();

      await manager.clearOrphanedTags();

      expect(deleteSpy).toHaveBeenCalledWith(tagBUnused.id);
      expect(deleteSpy).toHaveBeenCalledWith(tagDUnused.id);
      expect(deleteSpy).toHaveBeenCalledWith(tagFUnused.id);
      expect(deleteSpy).not.toHaveBeenCalledWith(tagAUsed.id);
      expect(deleteSpy).not.toHaveBeenCalledWith(tagCUsed.id);
      expect(deleteSpy).not.toHaveBeenCalledWith(tagEUsed.id);
      expect(deleteSpy).toHaveBeenCalledTimes(3);
    });
  });
});
