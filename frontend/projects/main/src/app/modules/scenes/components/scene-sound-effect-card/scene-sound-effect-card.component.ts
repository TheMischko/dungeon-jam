import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { VolumeControlComponent } from '../../../../player/player/volume-control/volume-control.component';
import { ScrollOverflowTextDirective } from '@general/directives/scroll-overflow-text.directive';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';

@Component({
  selector: 'app-scene-sound-effect-card',
  imports: [
    VolumeControlComponent,
    ScrollOverflowTextDirective,
    PlayPauseButtonComponent,
  ],
  templateUrl: './scene-sound-effect-card.component.html',
  styleUrl: './scene-sound-effect-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneSoundEffectCardComponent {
  readonly soundEffect = input.required<SoundEffect>();
  readonly isPlaying = input<boolean>(false);
  readonly volume = input<number>(0.5);

  readonly playSoundEffect = output<void>();
  readonly pauseSoundEffect = output<void>();
  readonly updateVolume = output<number>();

  readonly title = computed(() => {
    return this.soundEffect().name;
  });
  readonly playPauseState = computed(() => {
    return this.isPlaying() ? 'pause' : 'play';
  });

  playPauseClicked(): void {
    if (this.isPlaying()) {
      this.pauseSoundEffect.emit();
      return;
    }
    this.playSoundEffect.emit();
  }
}
