import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { PlaylistApiService } from './playlist-api.service';
import {
  Playlist,
  PlaylistOrderContext,
} from '@shared/models/playlist.model';
import {
  DisplayOrder,
  DisplayOrderPlacement,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistApiWindow } from '../../../models/api/playlist-api.model';

describe('PlaylistApiService', () => {
  let service: PlaylistApiService;
  let mockPlaylists: Playlist[];
  let mockQueryRequest: QueryRequest;

  const getPlaylistApi = () =>
    (window as unknown as PlaylistApiWindow).PLAYLIST_API;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistApiService);

    mockQueryRequest = {
      search: 'favorite',
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };

    mockPlaylists = [
      {
        id: 'playlist-1',
        name: 'My Favorites',
        tags: ['favorites', 'music'],
        trackIds: ['track-1', 'track-2'],
        order: 1,
        dateCreated: new Date('2024-01-01'),
        dateUpdated: new Date('2024-01-15'),
      },
      {
        id: 'playlist-2',
        name: 'Workout Mix',
        tags: ['workout', 'energy'],
        trackIds: ['track-3', 'track-4', 'track-5'],
        order: 2,
        dateCreated: new Date('2024-02-01'),
        dateUpdated: new Date('2024-02-10'),
      },
    ];

    (window as any).PLAYLIST_API = {
      getAllPlaylists: vi.fn().mockResolvedValue(mockPlaylists),
      getPlaylistById: vi.fn(),
      insertPlaylist: vi.fn(),
      addTracksToPlaylists: vi.fn(),
      updatePlaylist: vi.fn(),
      changePlaylistOrder: vi.fn(),
      changePlaylistRelativeOrder: vi.fn().mockResolvedValue(new Map()),
      deletePlaylist: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should return playlists when API call succeeds', async () => {
    const playlists = await firstValueFrom(
      service.getAllPlaylists(mockQueryRequest)
    );

    expect(playlists).toEqual(mockPlaylists);
    expect(playlists.length).toBe(2);
  });

  it('should emit error when API call fails', async () => {
    const testError = new Error('Failed to fetch playlists');
    vi.spyOn(getPlaylistApi(), 'getAllPlaylists').mockRejectedValue(testError);

    await expect(
      firstValueFrom(service.getAllPlaylists(mockQueryRequest))
    ).rejects.toEqual(testError);
  });

  it('should call getAllPlaylists with query options', async () => {
    await firstValueFrom(service.getAllPlaylists(mockQueryRequest));

    expect(getPlaylistApi().getAllPlaylists).toHaveBeenCalledWith(
      mockQueryRequest
    );
  });

  it('should call window.PLAYLIST_API.deletePlaylist when deletePlaylist is called', async () => {
    vi.spyOn(getPlaylistApi(), 'deletePlaylist').mockResolvedValue(undefined);

    await firstValueFrom(service.deletePlaylist('playlist-123'));

    expect(getPlaylistApi().deletePlaylist).toHaveBeenCalledWith(
      'playlist-123'
    );
  });

  it('should call window.PLAYLIST_API.changePlaylistRelativeOrder and return orderMap', async () => {
    const mockOrderMap = new Map<string, DisplayOrder>([
      [
        'playlist-1',
        {
          id: 'order-1',
          entityId: 'playlist-1',
          order: 0,
          entityType: OrderableEntityType.Playlist,
          contextType: PlaylistOrderContext.Landing,
        },
      ],
      [
        'playlist-2',
        {
          id: 'order-2',
          entityId: 'playlist-2',
          order: 1,
          entityType: OrderableEntityType.Playlist,
          contextType: PlaylistOrderContext.Landing,
        },
      ],
    ]);

    vi.spyOn(getPlaylistApi(), 'changePlaylistRelativeOrder').mockResolvedValue(
      mockOrderMap
    );

    const result = await firstValueFrom(
      service.reorderPlaylistRelative(
        'playlist-2',
        'playlist-1',
        DisplayOrderPlacement.BEFORE,
        PlaylistOrderContext.Landing
      )
    );

    expect(getPlaylistApi().changePlaylistRelativeOrder).toHaveBeenCalledWith({
      entityId: 'playlist-2',
      anchorEntityId: 'playlist-1',
      placement: DisplayOrderPlacement.BEFORE,
      contextType: PlaylistOrderContext.Landing,
      contextId: undefined,
    });
    expect(result).toBe(mockOrderMap);
  });
});
