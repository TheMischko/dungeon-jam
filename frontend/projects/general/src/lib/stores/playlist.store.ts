import {
  patchState,
  signalStore,
  type, withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  setEntities,
  withEntities,
} from '@ngrx/signals/entities';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
} from '@shared/models/playlist.model';
import { computed, inject } from '@angular/core';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  EMPTY,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
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
  withComputed((store) => {
    const playlistsWithParents = computed<(Playlist & { parentPlaylist: Playlist | null})[]>(() => {
      const playlists = store.entities();
      const playlistMap = new Map(playlists.map((p) => [p.id, p]));

      return playlists.map((playlist) => {
        const parentPlaylist = playlist.ownershipId
          ? playlistMap.get(playlist.ownershipId) || null
          : null;
        return {
          ...playlist,
          parentPlaylist,
        };
      });
    });

    return {
      playlistsWithParents
    }
  }),
  withMethods((store, playlistApiService = inject(PlaylistApiService)) => {
    const load = rxMethod<QueryRequest>(
      pipe(
        tap((query) =>
          patchState(store, { loading: true, lastLoadQuery: query }),
        ),
        debounceTime(500),
        switchMap((query) => {
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

    const addNewTracks = rxMethod<PlaylistAddTracksData>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((data) => {
          if (!Object.keys(data).length) {
            return EMPTY;
          }
          return playlistApiService.addTracks(data).pipe(
            tap((updated) => {
              const loadedPlaylistIds = store.ids();
              const updatedPlaylistIds = Array.from(updated.keys()).filter(
                (key) => loadedPlaylistIds.includes(key),
              );

              const updatedPlaylists = Array.from(updated.values()).filter(
                (playlist) => updatedPlaylistIds.includes(playlist.id),
              );

              patchState(store, setEntities(updatedPlaylists));
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
      insertNew,
      addNewTracks,
    };
  }),
);
