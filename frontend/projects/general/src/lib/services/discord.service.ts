import { Injectable } from '@angular/core';
import { DiscordWindow } from '../../../models/api/discord-api.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  DiscordState,
  DiscordStateType,
  DiscordTokenActiveUpdate,
  DiscordTokenData,
  GuildWithChannels,
} from '@shared/models/discord.model';

@Injectable({
  providedIn: 'root',
})
export class DiscordService {
  private readonly window = <DiscordWindow>window;
  private readonly discordStateSubject = new BehaviorSubject<DiscordState>({
    type: DiscordStateType.NONE,
  });
  private readonly activeTokensSubject = new BehaviorSubject<string[]>([]);

  get discordState$(): Observable<DiscordState> {
    return this.discordStateSubject.asObservable();
  }

  get activeTokens$(): Observable<string[]> {
    return this.activeTokensSubject.asObservable();
  }

  constructor() {
    this.window.DISCORD_API.onStateUpdate((state: DiscordState) => {
      this.discordStateSubject.next(state);
    });
    this.window.DISCORD_API.onActiveTokensUpdate(
      (update: DiscordTokenActiveUpdate) => {
        console.log('new tokens', update.connectedTokens);
        this.activeTokensSubject.next(update.connectedTokens);
      }
    );
  }

  getChannels(): Observable<GuildWithChannels[]> {
    const subject = new Subject<GuildWithChannels[]>();
    this.window.DISCORD_API.getChannels()
      .then((channels: GuildWithChannels[]) => {
        subject.next(channels);
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });

    return subject.asObservable();
  }

  joinChannel(guildId: string, channelId: string): Observable<void> {
    const subject = new Subject<void>();
    this.window.DISCORD_API.joinChannel(guildId, channelId)
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  disconnect(): Observable<void> {
    const subject = new Subject<void>();
    this.window.DISCORD_API.disconnect()
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  connectToken(tokenId: string): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.window.DISCORD_API.connectToken(tokenId)
      .then((result: boolean) => {
        subject.next(result);
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  disconnectToken(tokenId: string): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.window.DISCORD_API.disconnectToken(tokenId)
      .then((result: boolean) => {
        subject.next(result);
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  getConnectedTokens(): Observable<DiscordTokenData[]> {
    const subject = new Subject<DiscordTokenData[]>();
    this.window.DISCORD_API.getConnectedTokens()
      .then((tokens: DiscordTokenData[]) => {
        subject.next(tokens);
        subject.complete();
      })
      .catch((error: unknown) => {
        subject.error(error);
      });
    return subject.asObservable();
  }
}
