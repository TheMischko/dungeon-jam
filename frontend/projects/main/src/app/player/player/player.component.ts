import { Component, computed, inject, output } from '@angular/core';
import { PlaybackService } from '../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { initialPlaybackState } from '../../models/playback.model';
import { PlayPauseButtonComponent } from '../../../../../general/src/lib/components/buttons/play-pause-button/play-pause-button.component';
import { iconSet } from '../../../../../general/src/lib/icons/icons';
import { IconButtonComponent } from '../../../../../general/src/lib/components/buttons/icon-button/icon-button.component';

@Component({
  selector: 'app-player',
  imports: [PlayPauseButtonComponent, IconButtonComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  playbackService = inject(PlaybackService);
  playBackState = toSignal(this.playbackService.playback$, {
    initialValue: initialPlaybackState,
  });
  currentTrack = computed(() => this.playBackState().currentTrack);
  playing = computed(() => this.playBackState().isPlaying);
  playPauseState = computed(() => (this.playing() ? 'pause' : 'play'));

  skipPrev = output<void>();
  skipNext = output<void>();
  play = output<void>();
  pause = output<void>();

  readonly prevIcon = iconSet.PrevIcon;
  readonly nextIcon = iconSet.NextIcon;

  togglePlayPause(action: 'play' | 'pause') {
    if (action === 'pause') {
      this.pause.emit();
      return;
    }
    this.play.emit();
  }
}
