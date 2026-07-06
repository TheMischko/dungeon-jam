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
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { AppError } from '@shared/models/error.model';
import { SessionToastService } from '@general/services/toast/session-toast.service';

interface SessionStoreState {
  loading: boolean;
  lastLoadOptions: QueryOptions | null;
}

const initialState: SessionStoreState = {
  loading: false,
  lastLoadOptions: null,
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
      toastService = inject(SessionToastService)
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
                  loading: false,
                  lastLoadOptions: query,
                });
              }),
              catchError((err: AppError) => {
                toastService.showLoadAllError(err);
                return of([]);
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
      };
    }
  )
);
