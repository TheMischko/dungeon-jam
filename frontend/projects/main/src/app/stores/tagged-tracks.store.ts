import { patchState, signalStore, type, withMethods, withState } from '@ngrx/signals';
import { entityConfig, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { TaggedTracksQuery, Track } from '@shared/models/track.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { TrackService } from '../services/track.service';

type TaggedTracksStoreState = {
  loading: boolean;
}

const initialState: TaggedTracksStoreState = {
  loading: false,
};

const trackEntity = entityConfig({
  entity: type<Track>()
})

export const taggedTracksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(trackEntity),
  withMethods((store, trackService = inject(TrackService)) => {
    const load = rxMethod<TaggedTracksQuery>(pipe(
      tap(() => {
        patchState(store, { loading: true })
      }),
      switchMap((query) => {
        return trackService.getTaggedTracks(query).pipe(
          tap((tracks) => {
            patchState(store, setAllEntities(tracks))
          }),
          catchError((error) => {
            console.error('Error loading tagged tracks:', error);
            return of([]);
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      })
    ))

    return { load };
  })
)
