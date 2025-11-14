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
      toastService = inject(ToastService),
    ) => {
      const load = rxMethod<QueryRequest>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((query: QueryRequest) => {
            return trackApiService.getAllTracks(query).pipe(
              tap((tracks: Track[]) => {
                patchState(store, setAllEntities(tracks));
              }),
              catchError((error: Error) => {
                toastService.createToast(
                  'Load error',
                  error.message,
                  ToastType.Error,
                );
                return of([]);
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
    },
  ),
);
