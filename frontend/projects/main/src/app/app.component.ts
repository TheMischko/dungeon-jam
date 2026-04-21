import { Component, inject } from '@angular/core';
import { Howl } from 'howler';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { RoutingListenerService } from './services/routing-listener.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PlayerSmartComponent } from './player/player-smart/player-smart.component';
import { ApplicationStateService } from '@general/services/application-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { tap } from 'rxjs';
import { addAppInitClass } from '@general/utils/add-app-init-class';
import { DiscordTokenStore } from '@general/stores/discord-token.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    MatButton,
    RouterOutlet,
    MatDialogModule,
    PlayerSmartComponent,
    LoaderComponent,
  ],
})
export class AppComponent {
  private readonly routingListenerService = inject(RoutingListenerService);
  private readonly applicationStateService = inject(ApplicationStateService);
  private readonly discordTokenStore = inject(DiscordTokenStore);

  readonly applicationReady = toSignal(
    this.applicationStateService.applicationReady$.pipe(
      tap((ready) => addAppInitClass(ready))
    )
  );

  title = 'main';

  private howler: Howl;
  playing: boolean = false;

  constructor() {
    this.routingListenerService.initialize();
    this.howler = new Howl({
      src: ['lunatic.mp3'],
      volume: 0.5,
    });
  }

  togglePlay() {
    if (this.playing) {
      this.howler.pause();
      this.playing = false;
      return;
    }
    this.howler.play();
    this.playing = true;
  }
}
