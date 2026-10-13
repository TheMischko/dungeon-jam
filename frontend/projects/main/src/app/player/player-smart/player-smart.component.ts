import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PlayerComponent } from '../player/player.component';
import { PlaybackService } from '../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { initialPlaybackState } from '../../models/playback.model';
import { RedirectService } from '@general';
import { RedirectPath } from '@shared/models/redirect.model';
import { TrackHighlightService } from '../../services/track-highlight.service';

@Component({
  selector: 'app-player-smart',
  imports: [PlayerComponent],
  templateUrl: './player-smart.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ':host{ display: contents }',
})
export class PlayerSmartComponent {
  readonly playbackService = inject(PlaybackService);
  readonly redirectService = inject(RedirectService);
  readonly trackHighlightService = inject(TrackHighlightService);

  readonly playBackState = toSignal(this.playbackService.playback$, {
    initialValue: initialPlaybackState,
  });
  readonly trackPosition = toSignal(this.playbackService.position$, {
    initialValue: undefined,
  });

  async play() {
    if (!this.playBackState().isPlaying) {
      await this.playbackService.play();
    }
  }

  pause() {
    if (this.playBackState().isPlaying) {
      this.playbackService.pause();
    }
  }

  async playNextTrack() {
    await this.playbackService.playNext();
  }

  async playPrevTrack() {
    await this.playbackService.playPrev();
  }

  async seek(newPos: number) {
    const currentTrack = this.playBackState().currentTrack;
    if (newPos > 0 && currentTrack && newPos < currentTrack.duration) {
      this.playbackService.seek(newPos);
    }
  }

  changeVolume(volume: number) {
    this.playbackService.changeVolume(volume);
  }

  changeRepeat() {
    this.playbackService.changeRepeat();
  }

  shuffle() {
    this.playbackService.shuffle(!this.playBackState().shuffle);
  }

  protected navigateToActiveTrack() {
    const state = this.playBackState();
    const activeTrack = state.currentTrack;
    if (!activeTrack) {
      return;
    }

    if (state.sessionId) {
      this.trackHighlightService.setSessionHighlightedTrack(
        activeTrack.id,
        state.sessionId
      );
      this.redirectService.triggerRedirect({
        path: RedirectPath.SESSIONS,
        params: {
          sessionId: state.sessionId,
        },
      });
      return;
    }

    if (state.sceneId) {
      this.trackHighlightService.setSceneHighlightedTrack(
        activeTrack.id,
        state.sceneId
      );
      this.redirectService.triggerRedirect({
        path: RedirectPath.SCENES,
        params: {
          sceneId: state.sceneId,
        },
      });
      return;
    }

    if (state.playlistId) {
      this.trackHighlightService.setPlaylistHighlightedTrack(
        activeTrack.id,
        state.playlistId
      );
      this.redirectService.triggerRedirect({
        path: RedirectPath.PLAYLISTS,
        params: {
          playlistId: state.playlistId,
        },
      });
      return;
    }

    this.trackHighlightService.setLibraryHighlightedTrack(activeTrack.id);
    this.redirectService.triggerRedirect({
      path: RedirectPath.LIBRARY,
    });
  }
}
