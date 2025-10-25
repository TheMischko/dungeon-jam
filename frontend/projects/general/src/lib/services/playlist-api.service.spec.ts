import { TestBed } from '@angular/core/testing';
import { PlaylistApiService } from './playlist-api.service';
import { Playlist } from '@shared/models/playlist.model';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';

// Mock window.PLAYLIST_API for testing
declare global {
  interface Window {
    PLAYLIST_API: {
      getAllPlaylists: (options: QueryRequest) => Promise<Playlist[]>;
    };
  }
}

describe('PlaylistApiService', () => {
  let service: PlaylistApiService;
  let mockPlaylists: Playlist[];
  let mockQueryRequest: QueryRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistApiService);

    mockQueryRequest = {
      filter: 'favorite',
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

    spyOn(window.PLAYLIST_API, 'getAllPlaylists').and.returnValue(
      Promise.resolve(mockPlaylists),
    );
  });

  it('should return playlists when API call succeeds', () => {
    service.getAllPlaylists(mockQueryRequest).subscribe((playlists) => {
      expect(playlists).toEqual(mockPlaylists);
      expect(playlists.length).toBe(2);
    });
  });

  it('should emit error when API call fails', (done) => {
    const testError = new Error('Failed to fetch playlists');
    spyOn(window.PLAYLIST_API, 'getAllPlaylists').and.returnValue(
      Promise.reject(testError),
    );

    service.getAllPlaylists(mockQueryRequest).subscribe({
      error: (error) => {
        expect(error).toEqual(testError);
        done();
      },
    });
  });

  it('should call getAllPlaylists with query options', () => {
    service.getAllPlaylists(mockQueryRequest).subscribe(() => {
      expect(window.PLAYLIST_API.getAllPlaylists).toHaveBeenCalledWith(
        mockQueryRequest,
      );
    });
  });
});
