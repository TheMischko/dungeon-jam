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
  GuildWithChannels,
} from '@shared/models/discord.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  pipe,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { DestroyRef, effect, inject, untracked } from '@angular/core';
import { DiscordTokenApiService } from '@general/services/discord-token-api.service';
import { DiscordService } from '@general/services/discord.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type DiscordTokenStoreState = {
  loading: boolean;
  initialized: boolean;
  connectionMap: Record<string, DiscordStateType>;
  channelsMap: Record<string, GuildWithChannels[]>;
};

const initialState: DiscordTokenStoreState = {
  loading: false,
  initialized: false,
  connectionMap: {},
  channelsMap: {},
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
            return discordService.connectToken(token.id).pipe(
              tap((success) => {
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

      const disconnectToken = rxMethod<DiscordTokenData>(
        pipe(
          switchMap((token) => {
            return discordService.disconnectToken(token.id).pipe(
              tap((success) => {
                const map = store.connectionMap();
                patchState(store, {
                  connectionMap: {
                    ...map,
                    [token.id]: success
                      ? DiscordStateType.NONE
                      : DiscordStateType.ERROR,
                  },
                });
              }),
              catchError((err) => {
                console.error(
                  '[DiscordTokenStore] Failed to disconnect token',
                  err
                );
                const map = store.connectionMap();
                patchState(store, {
                  connectionMap: {
                    ...map,
                    [token.id]: DiscordStateType.ERROR,
                  },
                });
                setTimeout(() => {
                  patchState(store, {
                    connectionMap: {
                      ...map,
                      [token.id]: DiscordStateType.CONNECTED,
                    },
                  });
                }, 2000);
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
        disconnectToken,
      };
    }
  ),
  withHooks(
    (
      store,
      destroyRef = inject(DestroyRef),
      discordService = inject(DiscordService)
    ) => ({
      onInit() {
        if (!store.initialized()) {
          discordService.activeTokens$
            .pipe(takeUntilDestroyed(destroyRef), debounceTime(500))
            .subscribe((tokenIds) => {
              const connectionMap: { [key: string]: DiscordStateType } = {};
              tokenIds.forEach((id) => {
                connectionMap[id] = DiscordStateType.CONNECTED;
              });
              patchState(store, { connectionMap });
            });
        }

        effect(() => {
          const connectionMap = store.connectionMap();
          const connectionTokenIds = Object.keys(connectionMap).filter(
            (id) => connectionMap[id] === DiscordStateType.CONNECTED
          );
          const channelsMap = untracked(() => store.channelsMap());
          const tokensWithChannels = Object.keys(channelsMap);
          const tokensToFetch = connectionTokenIds.filter(
            (id) => !tokensWithChannels.includes(id)
          );
          const disconnectedTokens = tokensWithChannels.filter(
            (id) => !connectionTokenIds.includes(id)
          );
          const channelsMapWithoutDisconnected = { ...channelsMap };
          disconnectedTokens.forEach((id) => {
            delete channelsMapWithoutDisconnected[id];
          });
          patchState(store, {
            channelsMap: channelsMapWithoutDisconnected,
          });

          if (!tokensToFetch.length) {
            return;
          }

          const channelsSub = discordService
            .getChannelsForTokens(tokensToFetch)
            .pipe(take(1))
            .subscribe((result) => {
              if (!result || typeof result !== 'object') {
                return;
              }
              patchState(store, {
                channelsMap: {
                  ...store.channelsMap(),
                  ...result,
                },
              });
              console.log(
                '[DiscordTokenStore] Updated channels map',
                store.channelsMap()
              );
            });

          return () => {
            channelsSub.unsubscribe();
          };
        });

        patchState(store, { initialized: true });
      },
    })
  )
);
