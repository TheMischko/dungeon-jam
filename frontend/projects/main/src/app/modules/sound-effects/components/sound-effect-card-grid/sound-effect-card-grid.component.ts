import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import { iconSet } from '@general/icons/icons';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { SoundEffectCardComponent } from '../sound-effect-card/sound-effect-card.component';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';
import { SoundEffectVolumeChange } from '../../pages/sound-effects-library/sound-effects-library-smart/sound-effects-library-smart.component';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';

@Component({
  selector: 'app-sound-effect-card-grid',
  imports: [RangeSliderComponent, LoaderComponent, SoundEffectCardComponent],
  templateUrl: './sound-effect-card-grid.component.html',
  styleUrl: './sound-effect-card-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectCardGridComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);
  readonly actionsMenu = input<ActionsMenuBaseConfig<SoundEffect>[]>([]);

  /**
   * List of currently playing Sound Effect's IDs.
   */
  readonly currentlyPlaying = input<string[]>([]);

  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
  readonly effectVolumeChange = output<SoundEffectVolumeChange>();

  readonly sizeConfig = computed<GridSoundEffectSizeConfig>(() => {
    return getSizeConfig(this.cardSize());
  });

  readonly cardSize = signal<number>(0.75);

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;

  isPlaying(soundEffectId: string): boolean {
    return this.currentlyPlaying().includes(soundEffectId);
  }

  updateSize(value: number): void {
    if (value > 100 || value < 0) {
      return;
    }
    this.cardSize.set(value / 100);
  }

  emitVolumeChange(soundEffect: SoundEffect, volume: number): void {
    this.effectVolumeChange.emit({
      soundEffect: soundEffect,
      volume,
    });
  }
}

function getSizeConfig(size: number): GridSoundEffectSizeConfig {
  switch (true) {
    case size > 0.75:
      return {
        imageSize: 80,
        fontSize: 24,
      };
    case size > 0.5:
      return {
        imageSize: 60,
        fontSize: 18,
      };
    case size > 0.25:
      return {
        imageSize: 50,
        fontSize: 16,
        hideLoop: true,
      };
    case size >= 0:
      return {
        imageSize: 40,
        fontSize: 14,
        hideVolume: true,
        hideLoop: true,
      };
    default:
      return {
        imageSize: 50,
        fontSize: 16,
      };
  }
}
