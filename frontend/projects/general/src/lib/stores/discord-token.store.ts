import {
  patchState,
  signalStore,
  type,
  withHooks,
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
  DiscordStateType,
  DiscordTokenData,
  DiscordTokenUpdateData,
} from '@shared/models/discord.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { inject } from '@angular/core';
import { DiscordTokenApiService } from '@general/services/discord-token-api.service';
import { DiscordService } from '@general/services/discord.service';

type DiscordTokenStoreState = {
  loading: boolean;
  initialized: boolean;
  connectionMap: Record<string, DiscordStateType>;
};

const initialState: DiscordTokenStoreState = {
  loading: false,
  initialized: false,
  connectionMap: {},
};

const tokenEntity = entityConfig({
  entity: type<DiscordTokenData>(),
  selectId: (token) => token.id,
});

export const DiscordTokenStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(tokenEntity),
  withMethods(
    (
      store,
      tokenService = inject(DiscordTokenApiService),
      discordService = inject(DiscordService)
    ) => {
      const loadTokens = rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { loading: true });
          }),
          switchMap(() => {
            return tokenService.getAllTokens().pipe(
              tap((tokens) => {
                patchState(store, setAllEntities(tokens, tokenEntity), {
                  initialized: true,
                });
              }),
              catchError((err) => {
                console.error('[DiscordTokenStore] Failed to load tokens', err);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { loading: false });
              })
            );
          })
        )
      );

      const createToken = rxMethod<DiscordTokenUpdateData>(
        pipe(
          switchMap((data) => {
            return tokenService.createToken(data).pipe(
              tap((createdData) => {
                patchState(store, setEntity(createdData, tokenEntity));
              })
            );
          })
        )
      );

      const removeToken = rxMethod<string>(
        pipe(
          switchMap((id) => {
            return tokenService.deleteToken(id).pipe(
              tap(() => {
                patchState(store, removeEntity(id));
              })
            );
          })
        )
      );

      const updateToken = rxMethod<{
        id: string;
        newData: DiscordTokenUpdateData;
      }>(
        pipe(
          switchMap((data) => {
            return tokenService.updateToken(data.id, data.newData).pipe(
              tap((updatedData) => {
                patchState(store, setEntity(updatedData, tokenEntity));
              }),
              catchError((err) => {
                console.error(
                  '[DiscordTokenStore] Failed to update token',
                  err
                );
                return EMPTY;
              })
            );
          })
        )
      );

      const connectToken = rxMethod<DiscordTokenData>(
        pipe(
          filter((token) => {
            return store.entityMap()[token.id] !== undefined;
          }),
          tap((token) => {
            const map = store.connectionMap();
            patchState(store, {
              connectionMap: {
                ...map,
                [token.id]: DiscordStateType.CONNECTING,
              },
            });
          }),
          switchMap((token) => {
            console.log(`[DiscordTokenStore] Connecting token ${token.id}...`);
            return discordService.connectToken(token.id).pipe(
              tap((success) => {
                console.log(
                  `[DiscordTokenStore] Connection result for token ${token.id}: ${success}`
                );
                const map = store.connectionMap();
                patchState(store, {
                  connectionMap: {
                    ...map,
                    [token.id]: success
                      ? DiscordStateType.CONNECTED
                      : DiscordStateType.ERROR,
                  },
                });
              }),
              catchError((err) => {
                console.error(
                  '[DiscordTokenStore] Failed to connect token',
                  err
                );
                const map = store.connectionMap();
                patchState(store, {
                  connectionMap: {
                    ...map,
                    [token.id]: DiscordStateType.ERROR,
                  },
                });
                return EMPTY;
              })
            );
          })
        )
      );

      return {
        loadTokens,
        createToken,
        removeToken,
        updateToken,
        connectToken,
      };
    }
  ),
  withHooks((store) => ({
    onInit() {
      if (!store.initialized()) {
        store.loadTokens();
      }
    },
  }))
);
