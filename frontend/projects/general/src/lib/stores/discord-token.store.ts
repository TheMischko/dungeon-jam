import { patchState, signalStore, type, withHooks, withMethods, withState } from '@ngrx/signals';
import { entityConfig, removeEntity, setAllEntities, setEntity, withEntities } from '@ngrx/signals/entities';
import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, pipe, switchMap, tap } from 'rxjs';
import { inject } from '@angular/core';
import { DiscordTokenApiService } from '@general/services/discord-token-api.service';

type DiscordTokenStoreState = {
  loading: boolean;
  initialized: boolean;
}

const initialState: DiscordTokenStoreState = {
  loading: false,
  initialized: false
};

const tokenEntity = entityConfig({
  entity: type<DiscordTokenData>(),
  selectId: token => token.id
})

export const DiscordTokenStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(tokenEntity),
  withMethods((store, tokenService = inject(DiscordTokenApiService)) => {
    const loadTokens = rxMethod<void>(pipe(
      tap(() => {
        patchState(store, { loading: true });
      }),
      switchMap(() => {
        return tokenService.getAllTokens().pipe(
          tap((tokens) => {
            patchState(store, setAllEntities(tokens, tokenEntity), { initialized: true });
          }),
          catchError((err) => {
            console.error('[DiscordTokenStore] Failed to load tokens', err);
            return EMPTY;
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      })
    ));

    const createToken = rxMethod<DiscordTokenData>(pipe(
      switchMap((data) => {
        return tokenService.createToken(data).pipe(
          tap((createdData) => {
            patchState(store, setEntity(createdData, tokenEntity));
          })
        )
      })
    ));

    const removeToken = rxMethod<string>(pipe(
      switchMap((id) => {
        return tokenService.deleteToken(id).pipe(
          tap(() => {
            patchState(store, removeEntity(id))
          })
        )
      })
    ));

    const updateToken = rxMethod<{ id: string, newData: DiscordTokenUpdateData }>(pipe(
      switchMap((data) => {
        return tokenService.updateToken(data.id, data.newData).pipe(
          tap((updatedData) => {
            patchState(store, setEntity(updatedData, tokenEntity));
          }),
          catchError((err) => {
            console.error('[DiscordTokenStore] Failed to update token', err);
            return EMPTY;
          })
        );
      })
    ));


    return {
      loadTokens,
      createToken,
      removeToken,
      updateToken
    }
  }),
  withHooks( (store) => ({
    onInit(){
      if(!store.initialized()){
        store.loadTokens()
      }
    }
  }))
);
