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
  SceneUpdateQuery,
} from '@shared/models/scene.model';
import { inject } from '@angular/core';
import { SceneApiService } from '@general/services/scene-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { QueryOptions } from '@shared/models/request.model';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';

export type ScenesStoreState = {
  loading: boolean;
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

    return {
      loadAll,
      insert,
      update,
    };
  })
);
