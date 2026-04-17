import {Component, computed, input, output} from '@angular/core';
import { PlaybackState} from '../../models/playback.model';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { iconSet } from '@general/icons/icons';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';
import { LucideAngularModule } from 'lucide-angular';
import { VolumeControlComponent } from './volume-control/volume-control.component';
import {RepeatStateButtonComponent} from './repeat-state-button/repeat-state-button.component';
import { ShuffleButtonComponent } from './shuffle-button/shuffle-button.component';

@Component({
  selector: 'app-player',
  imports: [
    PlayPauseButtonComponent,
    IconButtonComponent,
    PlayerBarComponent,
    LucideAngularModule,
    VolumeControlComponent,
    RepeatStateButtonComponent,
    ShuffleButtonComponent,
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  playBackState = input.required<PlaybackState>();
  currentTrack = computed(() => this.playBackState().currentTrack);
  playing = computed(() => this.playBackState().isPlaying);
  playPauseState = computed(() => (this.playing() ? 'pause' : 'play'));
  queueCount = computed(() => this.playBackState().queue.length);
  volume = computed(() => this.playBackState().volume);
  repeat = computed(() => this.playBackState().repeat);
  shuffle = computed(() => this.playBackState().shuffle);

  skipPrev = output<void>();
  skipNext = output<void>();
  play = output<void>();
  pause = output<void>();
  seek = output<number>();
  volumeChange = output<number>();
  repeatChange = output<void>();
  shuffleChange = output<void>();

  readonly prevIcon = iconSet.PrevIcon;
  readonly nextIcon = iconSet.NextIcon;
  readonly playlistIcon = iconSet.PlaylistIcon;

  togglePlayPause(action: 'play' | 'pause') {
    if (action === 'pause') {
      this.pause.emit();
      return;
    }
    this.play.emit();
  }
}
