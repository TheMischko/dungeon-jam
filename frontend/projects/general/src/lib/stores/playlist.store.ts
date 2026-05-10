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
  setEntities,
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistOrderContext,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';
import { inject } from '@angular/core';
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
  withMethods((store, playlistApiService = inject(PlaylistApiService)) => {
    const load = rxMethod<QueryRequest>(
      pipe(
        tap((query) =>
          patchState(store, { loading: true, lastLoadQuery: query })
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
            })
          );
        })
      )
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
            })
          );
        })
      )
    );

    const updatePlaylist = rxMethod<PlaylistUpdateQuery>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((query) => {
          return playlistApiService.updatePlaylist(query).pipe(
            tap((updatedPlaylist) => {
              patchState(store, setEntity(updatedPlaylist));
            }),
            catchError((err) => {
              console.error(`Could not update playlist ${query.id}`, err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        })
      )
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
                (key) => loadedPlaylistIds.includes(key)
              );

              const updatedPlaylists = Array.from(updated.values()).filter(
                (playlist) => updatedPlaylistIds.includes(playlist.id)
              );

              patchState(store, setEntities(updatedPlaylists));
            }),
            catchError((err) => {
              console.error(err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        })
      )
    );

    const getParent = (playlistId: string) => {
      const playlistMap = store.entityMap();
      const playlist = playlistMap[playlistId];
      const parentId = playlist?.ownershipId;
      if (!parentId) {
        return null;
      }
      return playlistMap[parentId] || null;
    };

    const changeOrder = rxMethod<{ playlistId: string; newOrder: number }>(
      pipe(
        switchMap((query) => {
          return playlistApiService.reorderPlaylist(
            query.playlistId,
            query.newOrder,
            PlaylistOrderContext.Landing
          );
        })
      )
    );

    return {
      load,
      insertNew,
      addNewTracks,
      getParent,
      updatePlaylist,
      changeOrder,
    };
  })
);
