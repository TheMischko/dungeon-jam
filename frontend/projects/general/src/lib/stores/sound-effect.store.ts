import { QueryOptions } from '@shared/models/request.model';
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
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import {
  SoundEffect,
  SoundEffectContextType,
  SoundEffectCreateData,
  SoundEffectUpdateData,
} from '@shared/models/sound-effect.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  EMPTY,
  finalize,
  map,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { inject } from '@angular/core';
import { SoundEffectService } from '@general/services/sound-effect.service';
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';

type SoundEffectStoreState = {
  loading: boolean;
  lastLoadOptions: QueryOptions | null;
  latestOrderMap: Map<string, DisplayOrder>;
};

const initialState: SoundEffectStoreState = {
  loading: false,
  lastLoadOptions: null,
  latestOrderMap: new Map(),
};

const soundEffectConfig = entityConfig({
  entity: type<SoundEffect>(),
  selectId: (sfx) => sfx.id,
});

export const SoundEffectStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(soundEffectConfig),
  withMethods((store, soundEffectService = inject(SoundEffectService)) => {
    const loadAll = rxMethod<QueryOptions | void>(
      pipe(
        map((options) => {
          if (!options) {
            return store.lastLoadOptions();
          }
          return options;
        }),
        tap((options) => {
          patchState(store, { loading: true, lastLoadOptions: options });
        }),
        switchMap((options) => {
          return soundEffectService.getAll(options ?? {}).pipe(
            tap((effects) => {
              patchState(store, setAllEntities(effects));
            }),
            catchError((err) => {
              console.error(
                '[SoundEffectStore] cannot load sound effects',
                err
              );
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        }),
        switchMap(() => {
          return soundEffectService.getDisplayOrder().pipe(
            tap((orderMap) => {
              patchState(store, { latestOrderMap: orderMap });
            })
          );
        })
      )
    );

    const createEffect = rxMethod<SoundEffectCreateData>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((data) => {
          return soundEffectService.create(data).pipe(
            tap(() => {
              loadAll();
            }),
            catchError((err) => {
              console.error(`[SoundEffectStore] Cannot create`, data, err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        })
      )
    );

    const updateEffect = rxMethod<SoundEffectUpdateData>(
      pipe(
        debounceTime(250),
        switchMap((data) => {
          return soundEffectService.update(data).pipe(
            tap((updatedEffect) => {
              if (!updatedEffect) {
                console.error(
                  '[SoundEffectStore] Cannot find effect to update',
                  data
                );
                return;
              }
              const matchingRecord = store.entityMap()[data.id];
              if (matchingRecord) {
                patchState(store, setEntity(updatedEffect));
              }
            }),
            catchError((err) => {
              console.error(
                '[SoundEffectStore] Cannot update effect',
                data,
                err
              );
              return EMPTY;
            })
          );
        })
      )
    );

    /**
     * Deletes the sound effect matching the ID.
     * @param soundEffectId string
     */
    const deleteEffect = rxMethod<string>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((id) => {
          return soundEffectService.deleteById(id).pipe(
            tap(() => {
              patchState(store, removeEntity(id));
              loadAll(store.lastLoadOptions() ?? {});
            }),
            catchError((err) => {
              console.error('[SoundEffectStore] Cannot delete effect', err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        })
      )
    );

    const changeRelativeOrder = rxMethod<{
      soundEffectId: string;
      anchorId?: string;
      placement: DisplayOrderPlacement;
    }>(
      pipe(
        switchMap((query) => {
          return soundEffectService
            .reorderSoundEffectRelative(
              query.soundEffectId,
              query.anchorId,
              query.placement,
              SoundEffectContextType.Landing
            )
            .pipe(
              tap((orderMap) => {
                patchState(store, { latestOrderMap: orderMap });
              })
            );
        })
      )
    );

    return {
      loadAll,
      createEffect,
      updateEffect,
      deleteEffect,
      changeRelativeOrder,
    };
  })
);
