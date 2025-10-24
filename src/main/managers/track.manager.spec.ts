import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockElectron } from '../testing/mocks/mock-electron';
import {
  mockDatabase,
  mockDatabaseInstance,
} from '../testing/mocks/mock-database';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';
import { AudioFileChannel, TrackChannel } from '@shared/models/channels.model';
import { TrackManager } from './track.manager';
import { AudioTrack, Track } from '@shared/models/track.model';
import { mockAudioTrack, mockTrack } from '../testing/mocks/mock-track.data';
import { SortDirection } from '@shared/models/common.model';

vi.mock('electron', () => mockElectron);
vi.mock('./../database/database', () => mockDatabase);

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
      vi.spyOn(trackManager, 'getAll').mockReturnValue([]);

      await triggerIpcMainHandle(TrackChannel.GET_ALL);

      expect(trackManager.getAll).toHaveBeenCalled();
    });

    it('should response to GET_BY_ID with the matching track', async () => {
      const testId = 'test-123';
      vi.spyOn(trackManager, 'get').mockReturnValue(undefined);

      await triggerIpcMainHandle(TrackChannel.GET_BY_ID, testId);

      expect(trackManager.get).toHaveBeenCalledWith(testId);
    });

    it('should handle INSERT request by inserting the track values', async () => {
      const track: Track = mockTrack();
      vi.spyOn(trackManager, 'insert').mockReturnValue(Promise.resolve(track));

      await triggerIpcMainHandle(
        TrackChannel.INSERT,
        track.name,
        track.url,
        track.duration,
        track.author,
      );

      expect(trackManager.insert).toHaveBeenCalledWith(
        track.name,
        track.url,
        track.duration,
        track.author,
      );
    });

    it('should handle UPLOAD request by inserting all the tracks', async () => {
      const tracks: AudioTrack[] = [
        mockAudioTrack(),
        mockAudioTrack(),
        mockAudioTrack(),
      ];
      vi.spyOn(trackManager, 'insert').mockResolvedValue(mockTrack());

      await triggerIpcMainHandle<Track[]>(AudioFileChannel.UPLOAD, tracks);

      expect(trackManager.insert).toHaveBeenCalledTimes(tracks.length);
    });
  });

  describe('getAll', () => {
    it('getAll should read database table to fetch the all data', () => {
      const dataSet: Track[] = [mockTrack(), mockTrack(), mockTrack()];
      mockDatabaseInstance.readTable.mockImplementation(() => dataSet);
      const data = trackManager.getAll();

      expect(mockDatabaseInstance.readTable).toHaveBeenCalledWith('tracks');
      expect(data.length).toEqual(dataSet.length);
    });

    it('should filter the results by query value', () => {
      const testFilter = 'Love';
      const dataSet: Track[] = [
        mockTrack(),
        mockTrack({ name: `${testFilter} of Life` }),
        mockTrack({ author: `KillAllYou${testFilter}` }),
        mockTrack(),
      ];

      mockDatabaseInstance.readTable.mockImplementation(() => dataSet);

      const results = trackManager.getAll({ filter: testFilter });

      expect(results.length).toBe(2);
    });

    it('should sort by default by name', () => {
      const trackOfA = mockTrack({ name: 'Abc' });
      const trackOfH = mockTrack({ name: 'Hijk' });
      const trackOfZ = mockTrack({ name: 'Zzz' });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        trackOfH,
        trackOfZ,
        trackOfA,
      ]);

      const results = trackManager.getAll({ sortDirection: SortDirection.ASC });

      expect(results).toEqual([trackOfA, trackOfH, trackOfZ]);
    });

    it('should sort the values by author DESC', () => {
      const trackOfA = mockTrack({ author: 'Abc' });
      const trackOfH = mockTrack({ author: 'Hijk' });
      const trackOfZ = mockTrack({ author: 'Zzz' });

      mockDatabaseInstance.readTable.mockImplementation(() => [
        trackOfH,
        trackOfZ,
        trackOfA,
      ]);

      const results = trackManager.getAll({
        sortBy: 'author',
        sortDirection: SortDirection.DESC,
      });

      expect(results).toEqual([trackOfZ, trackOfH, trackOfA]);
    });
  });

  it('get should fetch a record with the matching id', () => {
    const testId = 'test123';
    const dataMock: Track[] = [
      mockTrack({ id: 'test145' }),
      mockTrack({ id: testId }),
      mockTrack({ id: undefined }),
    ];

    vi.spyOn(trackManager, 'getAll').mockImplementation(() => dataMock);

    const foundTrack = trackManager.get(testId);
    expect(foundTrack).toEqual(dataMock[1]);
  });

  it('insert should add the track to the database and generate an id', async () => {
    const audioTrack = mockAudioTrack();

    let createdTrack: Track;
    vi.spyOn(mockDatabaseInstance, 'updateTable').mockImplementation(
      (table: string, data: Track[]) => {
        expect(table).toEqual('tracks');

        createdTrack = data[0];
      },
    );

    await trackManager.insert(
      audioTrack.title,
      audioTrack.fullPath,
      audioTrack.length,
      audioTrack.author,
    );

    expect(mockDatabaseInstance.updateTable).toHaveBeenCalled();
    expect(createdTrack!.name).toEqual(audioTrack.title);
    expect(createdTrack!.id).toBeDefined();
  });
});
