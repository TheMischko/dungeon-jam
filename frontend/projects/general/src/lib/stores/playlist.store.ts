import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';
import { inject } from '@angular/core';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { QueryRequest } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';

type PlaylistStoreState = {
  loading: boolean;
  lastLoadQuery: QueryRequest;
};
const initialState: PlaylistStoreState = {
  loading: false,
  lastLoadQuery: {
    sortBy: 'order',
    sortDirection: SortDirection.ASC,
  },
};
const playlistConfig = entityConfig({
  entity: type<Playlist>(),
});

export const PlaylistStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(playlistConfig),
  withMethods((store, playlistApiService = inject(PlaylistApiService)) => {
    const load = rxMethod<QueryRequest>(
      pipe(
        switchMap((query) => {
          if (areQueriesEqual(query, store.lastLoadQuery())) {
            return EMPTY;
          }

          patchState(store, { loading: true, lastLoadQuery: query });

          return playlistApiService.getAllPlaylists(query).pipe(
            tap((playlists) => {
              patchState(store, setAllEntities(playlists));
            }),
            catchError((err) => {
              console.error(err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            }),
          );
        }),
      ),
    );

    const insertNew = rxMethod<PlaylistInsertQuery>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((data) => {
          return playlistApiService.insertPlaylist(data).pipe(
            tap(() => {
              load(store.lastLoadQuery());
            }),
            catchError((err) => {
              console.error(err);
              patchState(store, { loading: false });
              return EMPTY;
            }),
          );
        }),
      ),
    );
    return {
      load,
      insertNew,
    };
  }),
);

function areQueriesEqual(queryA: QueryRequest, queryB: QueryRequest): boolean {
  return (
    queryA.filter == queryB.filter &&
    queryA.sortBy === queryB.sortBy &&
    queryA.sortDirection === queryA.sortDirection
  );
}
