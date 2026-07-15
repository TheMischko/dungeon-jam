import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoutingListenerService } from './services/routing-listener.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PlayerSmartComponent } from './player/player-smart/player-smart.component';
import { ApplicationStateService } from '@general/services/application-state.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { tap } from 'rxjs';
import { addAppInitClass } from '@general/utils/add-app-init-class';
import { DiscordTokenStore } from '@general/stores/discord-token.store';
import { KeyboardShortcutService } from '@general/services/keyboard-shortcut.service';
import { PlaybackService } from './services/playback.service';
import { DialogService } from './services/dialog.service';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly routingListenerService = inject(RoutingListenerService);
  private readonly applicationStateService = inject(ApplicationStateService);
  private readonly discordTokenStore = inject(DiscordTokenStore);
  private readonly keyboardShortcutService = inject(KeyboardShortcutService);
  private readonly playbackService = inject(PlaybackService);
  private readonly dialogService = inject(DialogService);

  readonly applicationReady = toSignal(
    this.applicationStateService.applicationReady$.pipe(
      tap((ready) => addAppInitClass(ready))
    )
  );

  title = 'main';

  constructor() {
    this.routingListenerService.initialize();
    this.keyboardShortcutService.initialize();
    this.keyboardShortcutService.playPauseToggle$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.playbackService.togglePlayPause());
    this.keyboardShortcutService.closeSignal$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.dialogService.closeMostRecentDialog());
  }
}
