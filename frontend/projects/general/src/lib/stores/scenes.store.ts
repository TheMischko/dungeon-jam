import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  setAllEntities,
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import {
  Scene,
  SceneInsertQuery,
  SceneSoundEffectRef,
  SceneUpdateQuery,
} from '@shared/models/scene.model';
import { inject } from '@angular/core';
import { SceneApiService } from '@general/services/scene-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { QueryOptions } from '@shared/models/request.model';
import { catchError, EMPTY, finalize, of, pipe, switchMap, tap } from 'rxjs';

export type ScenesStoreState = {
  loading: boolean;
};

export type SceneSoundEffectVolumeUpdate = {
  sceneId: string;
  updatedReference: SceneSoundEffectRef;
};

const initialState: ScenesStoreState = {
  loading: false,
};

const sceneEntity = entityConfig({
  entity: type<Scene>(),
});

export const ScenesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(sceneEntity),
  withMethods((store, sceneApiService = inject(SceneApiService)) => {
    const loadAll = rxMethod<QueryOptions>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((options) => {
          return sceneApiService.getAll(options).pipe(
            tap((scenes) => {
              patchState(store, setAllEntities(scenes));
            }),
            catchError((err) => {
              console.error(err);
              return of([]);
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          );
        })
      )
    );

    const insert = rxMethod<SceneInsertQuery>(
      pipe(
        switchMap((data) => {
          return sceneApiService.insert(data).pipe(
            tap((newScene) => {
              patchState(store, addEntity(newScene));
            })
          );
        })
      )
    );

    const update = rxMethod<SceneUpdateQuery>(
      pipe(
        switchMap((data) => {
          return sceneApiService.update(data).pipe(
            tap((scene) => {
              patchState(store, setEntity(scene));
            })
          );
        })
      )
    );

    const updateSoundEffectVolume = rxMethod<SceneSoundEffectVolumeUpdate>(
      pipe(
        switchMap((updateData) => {
          const scene = store.entityMap()[updateData.sceneId];
          if (!scene) {
            return EMPTY;
          }

          const isAmbience = !!scene.ambience.find(
            (ref) =>
              ref.soundEffectId === updateData.updatedReference.soundEffectId
          );
          const isStinger = !!scene.stingers.find(
            (ref) =>
              ref.soundEffectId === updateData.updatedReference.soundEffectId
          );
          if (!isAmbience && !isStinger) {
            return EMPTY;
          }

          const updateRequest: SceneUpdateQuery = {
            id: updateData.sceneId,
            ...(isAmbience && {
              ambienceVolumeUpdate: updateData.updatedReference,
            }),
            ...(isStinger && {
              stingerVolumeUpdate: updateData.updatedReference,
            }),
          };

          return sceneApiService.update(updateRequest).pipe(
            tap((scene) => {
              patchState(store, setEntity(scene));
            })
          );
        })
      )
    );

    return {
      loadAll,
      insert,
      update,
      updateSoundEffectVolume,
    };
  })
);
