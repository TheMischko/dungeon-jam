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
import { GridItemSizeConfig } from '../../../../models/grid-item-size-config.model';

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

  /**
   * List of currently playing Sound Effect's IDs.
   */
  readonly currentlyPlaying = input<string[]>([]);

  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();

  readonly sizeConfig = computed<GridItemSizeConfig>(() => {
    return {
      imageSize: 24,
      fontSize: 16,
      overlaySize: 0,
      titleBold: true,
      hideTags: true,
      hideTracks: true,
    };
  });

  readonly cardSize = signal<number>(0.5);

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;

  isPlaying(soundEffectId: string): boolean {
    return this.currentlyPlaying().includes(soundEffectId);
  }

  updateSize(value: number): void {
    this.cardSize.set(value / 100);
  }
}
