import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';
import { actionsIconSet } from '@general/icons/icons';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { SceneSoundEffectCardComponent } from '../scene-sound-effect-card/scene-sound-effect-card.component';
import { ButtonType } from '../../../../../../../general/models/button.model';
import { SoundEffectVolumeChange } from '../../../../models/sound-effect.model';

@Component({
  selector: 'app-scene-sound-effects-list',
  imports: [
    PlayPauseButtonComponent,
    IconButtonComponent,
    SceneSoundEffectCardComponent,
  ],
  templateUrl: './scene-sound-effects-list.component.html',
  styleUrl: './scene-sound-effects-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneSoundEffectsListComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly playMap = input<Record<string, boolean>>({});
  readonly volumeMap = input<Record<string, number>>({});
  readonly title = input<string>('Sound effects');
  readonly showPlayAll = input<boolean>(true);

  readonly playAll = output<SoundEffect[]>();
  readonly pauseAll = output<SoundEffect[]>();
  readonly playSoundEffect = output<SoundEffect>();
  readonly pauseSoundEffect = output<SoundEffect>();
  readonly changeVolume = output<SoundEffectVolumeChange>();
  readonly changeSelection = output<void>();

  readonly config: GridSoundEffectSizeConfig = {
    hideLoop: true,
    imageSize: 0,
    showTags: false,
    titleBold: false,
    titleSize: 16,
  };
  readonly EditIcon = actionsIconSet.EditIcon;
  protected readonly ButtonType = ButtonType;

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

  protected emitVolumeChange(soundEffect: SoundEffect, volume: number): void {
    this.changeVolume.emit({
      soundEffect,
      volume,
    });
  }

  protected emitPlayAllOrPauseAll() {
    if (this.playingAll()) {
      this.pauseAll.emit(this.soundEffects());
    }
    this.playAll.emit(this.soundEffects());
  }

  protected isSoundEffectPlaying(soundEffect: SoundEffect) {
    const playingMap = this.playMap();
    return playingMap[soundEffect.id] ?? false;
  }

  protected getSoundEffectVolume(soundEffect: SoundEffect) {
    const volumeMap = this.volumeMap();
    return volumeMap[soundEffect.id] ?? 0.5;
  }
}
