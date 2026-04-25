import { Component, inject } from '@angular/core';
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

  constructor() {
    this.routingListenerService.initialize();
  }
}
