import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Track } from '@shared/models/track.model';
import { TrackService } from './track.service';
import { QueryRequest } from '@shared/models/request.model';
import { DEFAULT_PAGINATION_PAGES } from '../models/pagination.model';

@Service()
export class DiscoverTracksStateService {
  private readonly tracksApiService = inject(TrackService);

  private excludeIdsSet = new Set<string>();
  query: QueryRequest = {};
  batchSize: number = DEFAULT_PAGINATION_PAGES[0];

  private get excludeIdsList(): string[] {
    return Array.from(this.excludeIdsSet.values());
  }

  discoverTracks(
    playlistId: string,
    batchSize?: number,
    query?: QueryRequest
  ): Observable<Track[]> {
    const excludeIds = this.excludeIdsList;
    const size = batchSize ?? this.batchSize;
    const queryOptions = query ?? this.query;

    return this.tracksApiService.discoverTracks({
      random: true,
      playlistId,
      batchSize: size,
      excludeIds,
      ...queryOptions,
    });
  }

  excludeIds(ids: string[]): void {
    ids.forEach((id) => this.excludeIdsSet.add(id));
  }

  reset(): void {
    this.excludeIdsSet.clear();
    this.query = {};
    this.batchSize = DEFAULT_PAGINATION_PAGES[0];
  }
}
