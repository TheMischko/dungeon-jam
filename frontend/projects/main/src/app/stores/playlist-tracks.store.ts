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

type PlaylistTracksStoreState = {
  loading: boolean;
};

const initialState: PlaylistTracksStoreState = {
  loading: false,
};

const trackEntityConfig = entityConfig({
  entity: type<Track>(),
});

export const PlaylistTracksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(trackEntityConfig),
  withMethods((store, trackService = inject(TrackService)) => {
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
