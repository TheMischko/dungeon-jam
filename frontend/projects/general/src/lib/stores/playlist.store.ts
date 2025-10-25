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
import { Playlist } from '@shared/models/playlist.model';
import { inject } from '@angular/core';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { QueryRequest } from '@shared/models/request.model';

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
        switchMap((options) => {
          return playlistApiService.getAllPlaylists(options).pipe(
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
    return {
      load,
    };
  }),
);
