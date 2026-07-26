import {
  entityConfig,
  setAllEntities, setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { TagData, TagDetail } from '@shared/models/tag.model';
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
import { catchError, EMPTY, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { SortDirection } from '@shared/models/common.model';
import { QueryOptions } from '@shared/models/request.model';
import { TagHelperService } from '@general/services/tag-helper.service';

type TagsStoreState = {
  initialized: boolean;
  loading: boolean;
  details: Record<string, TagDetail>;
};

const initialState: TagsStoreState = {
  initialized: false,
  loading: false,
  details: {},
};

const tagsConfig = entityConfig({
  entity: type<TagData>(),
});

const DEFAULT_SORT: QueryOptions = {
  sortBy: 'title',
  sortDirection: SortDirection.ASC,
}

export const TagsStore = signalStore(
  { providedIn: 'root' },
  withState<TagsStoreState>(initialState),
  withEntities(tagsConfig),
  withMethods(
    (store,
     tagApiService = inject(TagApiService),
     tagHelperService = inject(TagHelperService),
    ) => {
    const loadAll = rxMethod<QueryOptions | void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((options)=> {
          return tagApiService.clearOrphanedTags().pipe(map(() => options));
        }),
        switchMap((options) => {
          return tagApiService
            .getAllTags(options ?? DEFAULT_SORT)
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

    const loadDetails = rxMethod<QueryOptions | void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true });
        }),
        switchMap((options) => {
          return tagApiService.getTagDetails(options ?? DEFAULT_SORT).pipe(
            tap((tagDetails) => {
              const map = tagHelperService.createTagDetailsMap(tagDetails);
              patchState(store, { details: map });
            }),
            catchError((err) => {
              console.error('Cannot load tag details', err);
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
            })
          )
        })
      )
    )

    const getById = (id: string): TagData | undefined => {
      return store.entityMap()[id];
    };

    const registerTag = (tag: TagData): void => {
      patchState(store, setEntity(tag));
    };

    const updateTag = rxMethod<TagData>(pipe(
      tap(() => {
        patchState(store, { loading: true });
      }),
      switchMap((updatedTag) => {
        return tagApiService.updateTag(updatedTag).pipe(
          tap((tag) => {
            patchState(store, setEntity(tag));
            const details = store.details();
            if(details[tag.id]){
              const updatedDetails = tagHelperService.updateDetailRecord(tag, details);
              patchState(store, { details: updatedDetails });
            }
          }),
          catchError((e) => {
            console.error(`Cannot update tag ${updatedTag.id}`, e);
            return EMPTY;
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      }
    )));

    return {
      loadAll,
      getById,
      updateTag,
      loadDetails,
      registerTag,
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
