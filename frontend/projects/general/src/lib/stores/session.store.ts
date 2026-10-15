import {
  entityConfig,
  removeEntity,
  setAllEntities,
  setEntity,
  withEntities,
} from '@ngrx/signals/entities';
import {
  SessionData,
  SessionInsertQuery,
  SessionOrderContext,
  SessionUpdateQuery,
} from '@shared/models/session.model';
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { SessionApiService } from '@general/services/session-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { QueryOptions } from '@shared/models/request.model';
import { catchError, concatMap, of, pipe, switchMap, tap } from 'rxjs';
import { AppError } from '@shared/models/error.model';
import { SessionToastService } from '@general/services/toast/session-toast.service';
import { DisplayOrderApiService } from '@general/services/display-order-api.service';
import {
  DisplayOrder,
  OrderableEntityType,
  RelativeDisplayOrderQuery,
} from '@shared/models/display-order.model';

interface SessionStoreState {
  loading: boolean;
  lastLoadOptions: QueryOptions | null;
  sessionImages: Record<string, string | null>;
  latestOrderMap: Map<string, DisplayOrder>;
}

const initialState: SessionStoreState = {
  loading: false,
  lastLoadOptions: null,
  sessionImages: {},
  latestOrderMap: new Map(),
};

enum SessionStoreEntity {
  SESSION = 'session',
}

const sessionEntityConfig = entityConfig<SessionData>({
  entity: type<SessionData>(),
  selectId: (session) => session.id,
  //collection: SessionStoreEntity.SESSION,
});

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(sessionEntityConfig),
  withMethods(
    (
      store,
      sessionApiService = inject(SessionApiService),
      toastService = inject(SessionToastService),
      displayOrderService = inject(DisplayOrderApiService)
    ) => {
      const load = rxMethod<QueryOptions>(
        pipe(
          tap(() => {
            patchState(store, { loading: true });
          }),
          switchMap((query) => {
            return sessionApiService.getAll(query).pipe(
              tap((sessions) => {
                patchState(store, setAllEntities(sessions), {
                  lastLoadOptions: query,
                });
              }),
              catchError((err: AppError) => {
                toastService.showLoadAllError(err);
                patchState(store, { loading: false });
                return of([]);
              }),
              switchMap((sessions) => {
                return displayOrderService
                  .getOrderMap({
                    entityType: OrderableEntityType.Session,
                    contextType: SessionOrderContext.Landing,
                  })
                  .pipe(
                    tap((orderMap) => {
                      patchState(store, { latestOrderMap: orderMap });
                    }),
                    switchMap(() => {
                      if (!sessions?.length) {
                        return of(void 0);
                      }
                      return sessionApiService
                        .getSessionImages(
                          sessions.map((s) => s.id).filter(Boolean)
                        )
                        .pipe(
                          tap((imageMap) => {
                            patchState(store, {
                              sessionImages: imageMap,
                              loading: false,
                            });
                          }),
                          catchError((err: AppError) => {
                            toastService.showLoadAllError(err);
                            patchState(store, { loading: false });
                            return of([]);
                          })
                        );
                    })
                  );
              })
            );
          })
        )
      );

      const changeRelativeOrder = rxMethod<RelativeDisplayOrderQuery>(
        pipe(
          concatMap((orderQuery) => {
            return sessionApiService
              .changeOrder({
                ...orderQuery,
                contextType: SessionOrderContext.Landing,
              })
              .pipe(
              tap((orderMap) => {
                patchState(store, { latestOrderMap: orderMap });
              })
              );
          })
        )
      );

      const insert = rxMethod<SessionInsertQuery>(
        pipe(
          switchMap((data) => {
            return sessionApiService.insert(data).pipe(
              tap((session) => {
                patchState(store, setEntity(session));
                toastService.showInsertSuccess(session);
              }),
              catchError((err) => {
                toastService.showInsertError(err);
                return of(void 0);
              })
            );
          })
        )
      );

      const update = rxMethod<SessionUpdateQuery>(
        pipe(
          switchMap((data) => {
            return sessionApiService.update(data).pipe(
              tap((session) => {
                patchState(store, setEntity(session));
                toastService.showUpdateSuccess(session);
              }),
              catchError((err) => {
                toastService.showUpdateError(err);
                return of(void 0);
              })
            );
          })
        )
      );

      const deleteSession = rxMethod<string>(
        pipe(
          switchMap((sessionId) => {
            return sessionApiService.delete(sessionId).pipe(
              tap(() => {
                patchState(store, removeEntity(sessionId));
                toastService.showDeleteSuccess();
              }),
              catchError((err) => {
                toastService.showDeleteError(err);
                return of(void 0);
              })
            );
          })
        )
      );

      return {
        load,
        insert,
        update,
        deleteSession,
        changeRelativeOrder,
      };
    }
  )
);
