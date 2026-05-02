import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { RepeatStateButtonComponent } from '../../../../player/player/repeat-state-button/repeat-state-button.component';
import { RepeatState } from '../../../../models/playback.model';
import { VolumeControlComponent } from '../../../../player/player/volume-control/volume-control.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-sound-effect-card',
  imports: [
    PlayPauseButtonComponent,
    RepeatStateButtonComponent,
    VolumeControlComponent,
    NgStyle,
  ],
  templateUrl: './sound-effect-card.component.html',
  styleUrl: './sound-effect-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectCardComponent {
  readonly soundEffect = input.required<SoundEffect>();
  readonly isPlaying = input<boolean>(false);
  readonly sizeConfig = input.required<GridSoundEffectSizeConfig>();

  readonly play = output<void>();
  readonly pause = output<void>();
  readonly loopingChange = output<void>();
  readonly volumeChange = output<number>();

  readonly isHovering = signal(false);

  readonly volumeState = computed<number>(() => {
    return this.soundEffect()?.volume ?? 0;
  });
  readonly playPauseState = computed<'play' | 'pause'>(() => {
    if (this.isPlaying()) {
      return 'pause';
    }
    return 'play';
  });
  readonly repeatState = computed<RepeatState>(() => {
    if (this.soundEffect()?.looping === true) {
      return RepeatState.ALL;
    }
    return RepeatState.NONE;
  });
  readonly titleSizeStyle = computed<Record<string, string>>(() => {
    const sizeConfig = this.sizeConfig();
    return {
      'font-weight': sizeConfig.titleBold ? 'bold' : 'normal',
      'font-size': `${sizeConfig.fontSize}px`,
    };
  });
  readonly gridStyle = computed<Record<string, string>>(() => {
    return {};
  });
  readonly showVolume = computed<boolean>(() => {
    const sizeConfig = this.sizeConfig();
    return !sizeConfig?.hideVolume;
  });
  readonly showLoop = computed<boolean>(() => {
    const sizeConfig = this.sizeConfig();
    return !sizeConfig?.hideLoop;
  });
  readonly showPlay = computed<boolean>(() => {
    const sizeConfig = this.sizeConfig();
    return !sizeConfig?.hidePlay;
  });

  onMouseEnter() {
    this.isHovering.set(true);
  }

  onMouseLeave() {
    this.isHovering.set(false);
  }

  protected handlePlayPause(event: 'play' | 'pause') {
    if (event === 'pause') {
      this.pause.emit();
      return;
    }
    this.play.emit();
  }
}
