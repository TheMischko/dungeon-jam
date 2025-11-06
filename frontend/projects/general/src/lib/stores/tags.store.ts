import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { TagData } from '@shared/models/tag.model';
import {
  patchState,
  signalStore,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { TagApiService } from '@general/services/tag-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';
import { SortDirection } from '@shared/models/common.model';

type TagsStoreState = {
  initialized: boolean;
  loading: boolean;
};

const initialState: TagsStoreState = {
  initialized: false,
  loading: false,
};

const tagsConfig = entityConfig({
  entity: type<TagData>(),
});

export const TagsStore = signalStore(
  { providedIn: 'root' },
  withState<TagsStoreState>(initialState),
  withEntities(tagsConfig),
  withMethods((store, tagApiService = inject(TagApiService)) => {
    const loadAll = rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap(() => {
          return tagApiService
            .getAllTags({
              sortBy: 'title',
              sortDirection: SortDirection.ASC,
            })
            .pipe(
              tap((tags) => {
                patchState(store, setAllEntities(tags));
              }),
              catchError((err) => {
                console.error(err);
                return of(null);
              }),
              finalize(() => {
                patchState(store, { loading: false });
              }),
            );
        }),
      ),
    );

    const getById = (id: string): TagData | undefined => {
      return store.entityMap()[id];
    };

    return {
      loadAll,
      getById,
    };
  }),
  withHooks({
    onInit(store) {
      if (store.initialized()) {
        return;
      }
      store.loadAll();
      patchState(store, { initialized: true });
    },
  }),
);
