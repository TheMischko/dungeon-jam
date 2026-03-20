import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';
import { DiscordTokenApiWindow } from '../../../models/api/discord-token-api.model';

@Injectable({
  providedIn: 'root',
})
export class DiscordTokenApiService {
  private readonly window = <DiscordTokenApiWindow>window;

  createToken(data: DiscordTokenData): Observable<DiscordTokenData> {
    const subject = new Subject<DiscordTokenData>();
    this.window.DISCORD_TOKEN_API.createToken(data)
      .then((token) => {
        subject.next(token);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  getAllTokens(): Observable<DiscordTokenData[]> {
    const subject = new Subject<DiscordTokenData[]>();
    this.window.DISCORD_TOKEN_API.getAllTokens()
      .then((tokens) => {
        subject.next(tokens);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  updateToken(id: string, newData: DiscordTokenUpdateData): Observable<DiscordTokenData> {
    const subject = new Subject<DiscordTokenData>();
    this.window.DISCORD_TOKEN_API.updateToken(id, newData)
      .then((token) => {
        subject.next(token);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  deleteToken(id: string): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.window.DISCORD_TOKEN_API.deleteToken(id)
      .then((result) => {
        subject.next(result);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }
}
