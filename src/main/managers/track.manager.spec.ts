import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockElectron } from '../testing/mocks/mock-electron';
import {
  mockDatabaseProviderInstance,
  MockDatabaseProviderCreator,
} from '../testing/mocks/mock-database-provider';
import {
  mockPlaylistManager,
  mockPlaylistManagerInstance,
} from '../testing/mocks/mock-playlist-manager';
import {
  mockFilesManager,
  mockFilesManagerInstance,
} from '../testing/mocks/mock-files-manager';
import { mockTagsManager } from '../testing/mocks/mock-tags-manager';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';
import { AudioFileChannel, TrackChannel } from '@shared/models/channels.model';
import { TrackManager } from './track.manager';
import {
  AudioTrack,
  Track,
  PlaylistTracksQuery,
} from '@shared/models/track.model';
import { mockAudioTrack, mockTrack } from '../testing/mocks/mock-track.data';
import { mockPlaylist } from '../testing/mocks/mock-playlist.data';
import { SortDirection } from '@shared/models/common.model';

vi.mock('electron', () => mockElectron);
vi.mock('./playlist.manager', () => mockPlaylistManager);
vi.mock('./files.manager', () => mockFilesManager);
vi.mock('./tags.manager', () => mockTagsManager);
vi.mock('../database/database-provider-creator', () => ({
  DatabaseProviderCreator: MockDatabaseProviderCreator,
}));

describe('TrackManager', () => {
  let trackManager: TrackManager;
  beforeEach(async () => {
    setupTestEnvironment();
    vi.mock('electron', () => mockElectron);
    TrackManager.__resetForTests();
    trackManager = await TrackManager.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('return the same instance all the time', async () => {
      const instanceA = await TrackManager.getInstance();
      const instanceB = await TrackManager.getInstance();

      expect(instanceA).toBe(instanceB);
    });

    it('should response to GET_ALL message with getting all the tracks', async () => {
      const mockTracks = [mockTrack()];
      vi.spyOn(mockDatabaseProviderInstance, 'getAll').mockResolvedValue(
        mockTracks,
      );

      await triggerIpcMainHandle(TrackChannel.GET_ALL);

      expect(mockDatabaseProviderInstance.getAll).toHaveBeenCalled();
    });

    it('should response to GET_BY_ID with the matching track', async () => {
      const testId = 'test-123';
      const mockResult = mockTrack({ id: testId });
      vi.spyOn(mockDatabaseProviderInstance, 'getBy').mockResolvedValue(
        mockResult,
      );

      await triggerIpcMainHandle(TrackChannel.GET_BY_ID, testId);

      expect(mockDatabaseProviderInstance.getBy).toHaveBeenCalledWith(
        'id',
        testId,
      );
    });

    it('should response to GET_PLAYLIST_TRACKS with tracks of the playlist', async () => {
      const query: PlaylistTracksQuery = {
        playlistId: 'test-123',
        filter: 'test',
      };
      const mockTracks = [mockTrack()];
      vi.spyOn(trackManager, 'getByPlaylist').mockResolvedValue(mockTracks);

      await triggerIpcMainHandle(TrackChannel.GET_PLAYLIST_TRACKS, query);

      expect(trackManager.getByPlaylist).toHaveBeenCalledWith(query);
    });

    it('should handle INSERT request by inserting the track values', async () => {
      const track: Track = mockTrack();
      vi.spyOn(mockDatabaseProviderInstance, 'create').mockResolvedValue(track);

      await triggerIpcMainHandle(
        TrackChannel.INSERT,
        track.name,
        track.url,
        track.duration,
        track.author,
      );

      expect(mockDatabaseProviderInstance.create).toHaveBeenCalled();
    });

    it('should handle UPLOAD request by inserting all the tracks', async () => {
      const tracks: AudioTrack[] = [
        mockAudioTrack(),
        mockAudioTrack(),
        mockAudioTrack(),
      ];
      const mockTrackResult = mockTrack();
      vi.spyOn(mockDatabaseProviderInstance, 'create').mockResolvedValue(
        mockTrackResult,
      );

      await triggerIpcMainHandle<Track[]>(AudioFileChannel.UPLOAD, tracks);

      expect(mockDatabaseProviderInstance.create).toHaveBeenCalledTimes(
        tracks.length,
      );
    });
  });

  describe('getAll', () => {
    it('getAll should return all tracks from the provider', async () => {
      const dataSet: Track[] = [mockTrack(), mockTrack(), mockTrack()];
      vi.spyOn(mockDatabaseProviderInstance, 'getAll').mockResolvedValue(
        dataSet,
      );

      const data = await trackManager.getAll();

      expect(mockDatabaseProviderInstance.getAll).toHaveBeenCalled();
      expect(data.length).toEqual(dataSet.length);
    });

    it('should pass the query to the provider', async () => {
      const dataSet: Track[] = [mockTrack()];
      const query = {
        filter: 'test',
        sortBy: 'name',
        sortDirection: SortDirection.ASC,
      };
      vi.spyOn(mockDatabaseProviderInstance, 'getAll').mockResolvedValue(
        dataSet,
      );

      await trackManager.getAll(query);

      expect(mockDatabaseProviderInstance.getAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getByPlaylist', () => {
    it('should return empty array when playlist does not exist', async () => {
      mockPlaylistManagerInstance.getById.mockResolvedValue(null);

      const query: PlaylistTracksQuery = { playlistId: 'nonexistent' };
      const result = await trackManager.getByPlaylist(query);

      expect(mockPlaylistManagerInstance.getById).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return tracks that are in the playlist', async () => {
      const track1 = mockTrack();
      const track2 = mockTrack();
      const track3 = mockTrack();
      const playlist = mockPlaylist({ trackIds: [track1.id, track2.id] });

      mockPlaylistManagerInstance.getById.mockResolvedValue(playlist);

      vi.spyOn(trackManager, 'getAll').mockResolvedValue([
        track1,
        track2,
        track3,
      ]);

      const query: PlaylistTracksQuery = { playlistId: playlist.id };
      const result = await trackManager.getByPlaylist(query);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(track1);
      expect(result).toContainEqual(track2);
    });

    it('should filter playlist tracks by query filter parameter', async () => {
      const track1 = mockTrack({ name: 'Love Song' });
      const track2 = mockTrack({ name: 'Hate Song' });
      const track3 = mockTrack({ name: 'Love Album' });
      const playlist = mockPlaylist({
        trackIds: [track1.id, track2.id, track3.id],
      });

      mockPlaylistManagerInstance.getById.mockResolvedValue(playlist);

      // Mock getAll to return only tracks that match the filter (Love)
      vi.spyOn(trackManager, 'getAll').mockResolvedValue([track1, track3]);

      const query: PlaylistTracksQuery = {
        playlistId: playlist.id,
        filter: 'Love',
      };
      const result = await trackManager.getByPlaylist(query);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(track1);
      expect(result).toContainEqual(track3);
    });
  });

  it('get should fetch a record with the matching id', async () => {
    const testId = 'test123';
    const dataMock = mockTrack({ id: testId });

    vi.spyOn(mockDatabaseProviderInstance, 'getBy').mockResolvedValue(dataMock);

    const foundTrack = await trackManager.get(testId);
    expect(foundTrack).toEqual(dataMock);
    expect(mockDatabaseProviderInstance.getBy).toHaveBeenCalledWith(
      'id',
      testId,
    );
  });

  it('insert should add the track to the database and generate an id', async () => {
    const audioTrack = mockAudioTrack();
    const expectedTrack = mockTrack({
      name: audioTrack.title,
      url: audioTrack.fullPath,
      duration: audioTrack.length,
      author: audioTrack.author,
    });

    vi.spyOn(mockDatabaseProviderInstance, 'create').mockResolvedValue(
      expectedTrack,
    );

    const createdTrack = await trackManager.insert(
      audioTrack.title,
      audioTrack.fullPath,
      audioTrack.length,
      audioTrack.author,
    );

    expect(mockDatabaseProviderInstance.create).toHaveBeenCalled();
    expect(createdTrack.name).toEqual(audioTrack.title);
    expect(createdTrack.id).toBeDefined();
  });

  describe('update', () => {
    it('should update track in the database', async () => {
      const track = mockTrack({
        name: 'Updated Track',
        author: 'Updated Author',
      });

      vi.spyOn(mockDatabaseProviderInstance, 'update').mockResolvedValue(track);
      mockFilesManagerInstance.updateTrackFile.mockResolvedValue(undefined);

      const result = await trackManager['update'](track);

      expect(mockDatabaseProviderInstance.update).toHaveBeenCalledWith(
        'id',
        track.id,
        track,
      );
      expect(result).toEqual(track);
    });

    it('should update track file metadata after updating the track', async () => {
      const track = mockTrack({
        name: 'Updated Track',
        author: 'Updated Author',
      });

      vi.spyOn(mockDatabaseProviderInstance, 'update').mockResolvedValue(track);
      mockFilesManagerInstance.updateTrackFile.mockResolvedValue(undefined);

      await trackManager['update'](track);

      expect(mockFilesManagerInstance.updateTrackFile).toHaveBeenCalledWith(
        track,
      );
    });

    it('should handle metadata update errors gracefully during update', async () => {
      const track = mockTrack();
      vi.spyOn(mockDatabaseProviderInstance, 'update').mockResolvedValue(track);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const updateError = new Error('Metadata update failed');
      mockFilesManagerInstance.updateTrackFile.mockRejectedValue(updateError);

      const result = await trackManager['update'](track);

      expect(mockFilesManagerInstance.updateTrackFile).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[TrackManager] Failed to update track file metadata',
        updateError,
      );
      expect(result).toEqual(track);

      consoleSpy.mockRestore();
    });
  });
});
