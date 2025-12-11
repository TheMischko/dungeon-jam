import { Injectable } from '@angular/core';
import { DiscordWindow } from '../../../models/api/discord-api.model';
import { Observable, Subject } from 'rxjs';
import { GuildWithChannels } from '@shared/models/discord.model';

@Injectable({
  providedIn: 'root',
})
export class DiscordService {
  private readonly window = <DiscordWindow>window;

  getChannels(): Observable<GuildWithChannels[]> {
    const subject = new Subject<GuildWithChannels[]>();
    setTimeout(() => {
      this.window.DISCORD_API.getChannels()
        .then((channels: GuildWithChannels[]) => {
          subject.next(channels);
          subject.complete();
        })
        .catch((error: unknown) => {
          subject.error(error);
        });
    }, 5000);

    return subject.asObservable();
  }
}
