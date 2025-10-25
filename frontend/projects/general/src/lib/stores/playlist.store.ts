import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntities,
  entityConfig,
  withEntities,
} from '@ngrx/signals/entities';
import { Playlist } from '@shared/models/playlist.model';
import { inject } from '@angular/core';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, of, pipe, switchMap, tap } from 'rxjs';
import { QueryRequest } from '@shared/models/request.model';
import { playlistsMock } from '@general/stores/playlists.mock';

type PlaylistStoreState = {
  loading: boolean;
};
const initialState: PlaylistStoreState = {
  loading: false,
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
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((_) => {
          return of(playlistsMock).pipe(
            tap((playlists) => {
              patchState(store, addEntities(playlists));
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
    return {
      load,
    };
  }),
);
