import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  removeEntity,
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
import { PlaylistToastService } from '@general/services/toast/playlist-toast.service';

type PlaylistStoreState = {
  loading: boolean;
  lastLoadQuery: QueryRequest;
  allParents: Playlist[];
};
const initialState: PlaylistStoreState = {
  loading: false,
  lastLoadQuery: {
    sortBy: 'order',
    sortDirection: SortDirection.ASC,
  },
  allParents: [],
};
const playlistConfig = entityConfig({
  entity: type<Playlist>(),
});

export const PlaylistStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(playlistConfig),
  withMethods(
    (
      store,
      playlistApiService = inject(PlaylistApiService),
      toastService = inject(PlaylistToastService)
    ) => {
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
                updateParents();
              }),
              catchError((err) => {
                toastService.showLoadError(err);
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
                toastService.showInsertSuccess(data.name);
                load(store.lastLoadQuery());
              }),
              catchError((err) => {
                toastService.showInsertError(err);
                patchState(store, { loading: false });
                return EMPTY;
              })
            );
          })
        )
      );

      const update = rxMethod<void>(
        pipe(tap(() => load(store.lastLoadQuery())))
      );

      const updateParents = () => {
        const playlists = store.entities();
        const currentParents = store.allParents();

        const updatedParents = currentParents
          .map((formerParent) => {
            const currentVersion = playlists.find(
              (p) => p.id === formerParent.id
            );
            return currentVersion ?? formerParent;
          })
          .filter((parent) => !!parent.childrenIds?.length);

        const newParents = playlists.filter((p) => {
          return (
            !!p.childrenIds?.length &&
            !updatedParents.some((curr) => curr.id === p.id)
          );
        });

        const parents = [...updatedParents, ...newParents].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        patchState(store, { allParents: parents });
      };

      const updatePlaylist = rxMethod<PlaylistUpdateQuery>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((query) => {
            return playlistApiService.updatePlaylist(query).pipe(
              tap((updatedPlaylist) => {
                toastService.showUpdateSuccess(updatedPlaylist.name);
                patchState(store, setEntity(updatedPlaylist));
                update();
              }),
              catchError((err) => {
                toastService.showUpdateError(err);
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

                toastService.showTracksAddedSuccess();

                patchState(store, setEntities(updatedPlaylists));
              }),
              catchError((err) => {
                toastService.showTracksAddedError(err);
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

      const deletePlaylist = rxMethod<string>(
        pipe(
          switchMap((playlistId) => {
            return playlistApiService.deletePlaylist(playlistId).pipe(
              tap(() => {
                toastService.showDeleteSuccess();
                patchState(store, removeEntity(playlistId));
                update();
              }),
              catchError((err) => {
                toastService.showDeleteError(err);
                return EMPTY;
              })
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
        deletePlaylist,
      };
    }
  )
);
