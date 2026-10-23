import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RedirectService } from '@general';
import { toSignal } from '@angular/core/rxjs-interop';
import { RedirectPath, RedirectRequest } from '@shared/models/redirect.model';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { SessionApiService } from '@general/services/session-api.service';
import { SceneApiService } from '@general/services/scene-api.service';
import { firstValueFrom } from 'rxjs';
import { NgClass } from '@angular/common';
import { NoHistoryNavigation } from './return-back-button.types';

@Component({
  imports: [NgClass],
  selector: 'app-return-back-button',
  styleUrl: './return-back-button.component.scss',
  templateUrl: './return-back-button.component.html',
})
export class ReturnBackButtonComponent {
  readonly redirectService = inject(RedirectService);
  readonly playlistApiService = inject(PlaylistApiService);
  readonly sessionApiService = inject(SessionApiService);
  readonly sceneApiService = inject(SceneApiService);

  readonly showBackdrop = input<boolean>(false);
  readonly noHistoryNavigation = input<NoHistoryNavigation | undefined>(
    undefined
  );

  readonly historyRequest = toSignal(
    this.redirectService.latestHistoryRecord$,
    { initialValue: null }
  );

  readonly backToText = signal<string | null>(null);
  private historyRequestId = 0;

  readonly cssClasses = computed(() => {
    if (this.showBackdrop()) {
      return ['backdrop'];
    }
    return [];
  });

  constructor() {
    effect(async () => {
      const requestId = ++this.historyRequestId;
      const latestHistory = this.historyRequest();
      if (latestHistory === null) {
        this.backToText.set(this.noHistoryNavigation()?.text ?? null);
        return;
      }
      try {
        const correctText = await this.getCorrectReturnBackText(latestHistory);
        if (requestId === this.historyRequestId) {
          this.backToText.set(correctText);
        }
      } catch (error) {
        if (requestId === this.historyRequestId) {
          console.error('Failed to resolve back navigation label', error);
          this.backToText.set(null);
        }
      }
    });
  }

  returnBack(): void {
    const noHistoryNavigation = this.noHistoryNavigation();
    if (this.historyRequest() === null && noHistoryNavigation) {
      this.redirectService.triggerRedirect(noHistoryNavigation.redirect);
      return;
    }
    this.redirectService.navigateBack();
  }

  private async getCorrectReturnBackText(
    recentHistory: RedirectRequest
  ): Promise<string | null> {
    switch (recentHistory.path) {
      case RedirectPath.HOME:
        return 'Back to Home';
      // ---
      case RedirectPath.LIBRARY:
        return 'Back to Library';
      // ---
      case RedirectPath.PLAYLISTS:
        const playlistId = recentHistory.params?.['playlistId'];
        if (playlistId) {
          const playlist = await firstValueFrom(
            this.playlistApiService.getById(playlistId)
          );
          if (playlist) {
            return `Back to ${playlist.name}`;
          }
          return null;
        }
        return 'Back to Playlists';
      // ---
      case RedirectPath.SOUND_EFFECTS:
        return 'Back to Sound Effects';
      // ---
      case RedirectPath.SCENES:
        const sceneId = recentHistory.params?.['sceneId'];
        if (sceneId) {
          const scene = await firstValueFrom(
            this.sceneApiService.getById(sceneId)
          );
          if (scene) {
            return `Back to ${scene.name}`;
          }
          return null;
        }
        return 'Back to Scenes';
      // ---
      case RedirectPath.SESSIONS:
        const sessionId = recentHistory.params?.['sessionId'];
        if (sessionId) {
          const session = await firstValueFrom(
            this.sessionApiService.getById(sessionId)
          );
          if (session) {
            return `Back to ${session.name}`;
          }
          return null;
        }
        return 'Back to Sessions';
      // ---
      case RedirectPath.TAGS:
        return 'Back to Tags';
      // ---
      case RedirectPath.SETTINGS:
        return 'Back to Settings';
      // ---
      default:
        return null;
    }
  }
}
