import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { SoundEffectCardComponent } from '../../../sound-effects/components/sound-effect-card/sound-effect-card.component';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';

@Component({
  selector: 'app-scene-sound-effects-list',
  imports: [PlayPauseButtonComponent, SoundEffectCardComponent],
  templateUrl: './scene-sound-effects-list.component.html',
  styleUrl: './scene-sound-effects-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneSoundEffectsListComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly playMap = input<Record<string, boolean>>({});

  readonly playAll = output<SoundEffect[]>();
  readonly pauseAll = output<SoundEffect[]>();
  readonly playSoundEffect = output<SoundEffect>();
  readonly pauseSoundEffect = output<SoundEffect>();
  readonly changeVolume = output<SoundEffectVolumeChange>();

  readonly config: GridSoundEffectSizeConfig = {
    hideLoop: true,
    imageSize: 0,
    showTags: false,
    titleBold: false,
    titleSize: 16,
  };

  readonly playingAll = computed(() => {
    const soundEffects = this.soundEffects();
    const playMap = this.playMap();

    if (!soundEffects.length) {
      return false;
    }

    return soundEffects.every((soundEffect) => {
      return playMap?.[soundEffect.id] ?? false;
    });
  });

  readonly playingAllState = computed(() =>
    this.playingAll() ? 'pause' : 'play'
  );

  emitVolumeChange(soundEffect: SoundEffect, volume: number): void {
    this.changeVolume.emit({
      soundEffect,
      volume,
    });
  }

  emitPlayAllOrPauseAll() {
    if (this.playingAll()) {
      this.pauseAll.emit(this.soundEffects());
    }
    this.playAll.emit(this.soundEffects());
  }
}

export type SoundEffectVolumeChange = {
  soundEffect: SoundEffect;
  volume: number;
};
