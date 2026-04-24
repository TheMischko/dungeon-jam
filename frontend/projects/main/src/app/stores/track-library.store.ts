import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  entityConfig,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Track } from '@shared/models/track.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { QueryRequest } from '@shared/models/request.model';
import { inject } from '@angular/core';
import { TrackService } from '../services/track.service';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ToastType } from '../models/toast.model';

type TrackLibraryStoreState = {
  loading: boolean;
};
const initialState: TrackLibraryStoreState = {
  loading: false,
};
const trackConfig = entityConfig({
  entity: type<Track>(),
});

export const TrackLibraryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(trackConfig),
  withMethods(
    (
      store,
      trackApiService = inject(TrackService),
      toastService = inject(ToastService)
    ) => {
      const load = rxMethod<QueryRequest>(
        pipe(
          tap(() => patchState(store, { loading: true }, removeAllEntities())),
          switchMap((query: QueryRequest) => {
            return trackApiService.getAllTracks(query).pipe(
              tap((tracks: Track[]) => {
                patchState(store, setAllEntities(tracks));
              }),
              catchError((error: Error) => {
                toastService.createToast(
                  'Load error',
                  error.message,
                  ToastType.Error
                );
                return of([]);
              }),
              finalize(() => {
                patchState(store, { loading: false });
              })
            );
          })
        )
      );

      const updateTrack = rxMethod<Track>(
        pipe(
          switchMap((track: Track) => {
            return trackApiService.updateTrack(track).pipe(
              catchError((err) => {
                toastService.createToast(
                  'Update error',
                  err.message,
                  ToastType.Error
                );
                return of(null);
              }),
              tap(() => {
                toastService.createToast(
                  'Track updated',
                  'The track was successfully updated.',
                  ToastType.Success
                );
                patchState(store, setEntity(track));
              })
            );
          })
        )
      );

      const removeTrack = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((trackId: string) => {
            return trackApiService.deleteTrack(trackId).pipe(
              catchError((err) => {
                toastService.createToast(
                  'Delete error',
                  err.message,
                  ToastType.Error
                );
                return of(false);
              }),
              tap(() => {
                toastService.createToast(
                  'Track deleted',
                  'The track was successfully deleted.',
                  ToastType.Success
                );
                patchState(store, removeEntity(trackId));
              }),
              finalize(() => {
                patchState(store, { loading: false });
              })
            );
          })
        )
      );

      return {
        load,
        updateTrack,
        removeTrack,
      };
    }
  )
);
