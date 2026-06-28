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
import { PlaylistTracksQuery, Track } from '@shared/models/track.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { TrackService } from '../services/track.service';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { ToastService } from '@general/services/toast.service';
import { ToastType } from '../../../../general/models/toast.model';

type PlaylistTracksStoreState = {
  loading: boolean;
  lastLoadOptions: PlaylistTracksQuery | undefined;
};

const initialState: PlaylistTracksStoreState = {
  loading: false,
  lastLoadOptions: undefined,
};

const trackEntityConfig = entityConfig({
  entity: type<Track>(),
});

export const PlaylistTracksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(trackEntityConfig),
  withMethods(
    (
      store,
      trackService = inject(TrackService),
      playlistService = inject(PlaylistApiService),
      toastService = inject(ToastService)
    ) => {
      const load = rxMethod<PlaylistTracksQuery>(
        pipe(
          tap(() => {
            patchState(store, { loading: true });
          }),
          switchMap((query) => {
            return trackService.getTracksByPlaylist(query).pipe(
              tap((tracks) => {
                patchState(store, setAllEntities(tracks));
              }),
              catchError((err) => {
                toastService.createToast('Load error', err, ToastType.Error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { loading: false, lastLoadOptions: query });
              })
            );
          })
        )
      );

      const removeTrackFromPlaylist = rxMethod<{
        playlistId: string;
        trackId: string;
      }>(
        pipe(
          switchMap(({ playlistId, trackId }) => {
            return playlistService.removeTracks(playlistId, [trackId]).pipe(
              tap(() => {
                const lastLoadOptions = store.lastLoadOptions();
                if (!lastLoadOptions) {
                  return;
                }
                load(lastLoadOptions);
              }),
              catchError((err) => {
                toastService.createToast('Save error', err, ToastType.Error);
                return EMPTY;
              })
            );
          })
        )
      );

      return {
        load,
        removeTrackFromPlaylist,
      };
    }
  )
);
