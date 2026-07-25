import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { SoundEffectCardComponent } from '../sound-effect-card/sound-effect-card.component';
import { GridSoundEffectSizeConfig } from '../../../../models/grid-item-size-config.model';
import { SoundEffectVolumeChange } from '../../pages/sound-effects-library/sound-effects-library-smart/sound-effects-library-smart.component';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { GridControlsComponent } from '../../../../components/grid/grid-controls/grid-controls.component';
import { SoundEffectDisplayModeSwitchComponent } from '../sound-effect-display-mode-switch/sound-effect-display-mode-switch.component';

@Component({
  selector: 'app-sound-effect-card-grid',
  imports: [
    LoaderComponent,
    SoundEffectCardComponent,
    CdkDropList,
    CdkDrag,
    GridControlsComponent,
    SoundEffectDisplayModeSwitchComponent,
  ],
  templateUrl: './sound-effect-card-grid.component.html',
  styleUrl: './sound-effect-card-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectCardGridComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);
  readonly actionsMenu = input<ActionsMenuBaseConfig<SoundEffect>[]>([]);
  readonly viewMode = input<'grid' | 'table'>('grid');

  /**
   * List of currently playing Sound Effect's IDs.
   */
  readonly currentlyPlaying = input<string[]>([]);

  readonly search = output<string>();
  readonly modeChange = output<'grid' | 'table'>();
  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
  readonly effectVolumeChange = output<SoundEffectVolumeChange>();
  readonly reorderDrop = output<CdkDragDrop<SoundEffect[]>>();

  readonly sizeConfig = computed<GridSoundEffectSizeConfig>(() => {
    return getSizeConfig(this.cardSize());
  });

  readonly cardSize = signal<number>(0.75);

  isPlaying(soundEffectId: string): boolean {
    return this.currentlyPlaying().includes(soundEffectId);
  }

  emitVolumeChange(soundEffect: SoundEffect, volume: number): void {
    this.effectVolumeChange.emit({
      soundEffect: soundEffect,
      volume,
    });
  }

  protected soundEffectDropped(event: CdkDragDrop<SoundEffect[]>) {
    this.reorderDrop.emit(event);
  }
}

function getSizeConfig(size: number): GridSoundEffectSizeConfig {
  switch (true) {
    case size > 0.75:
      return {
        imageSize: 80,
        titleSize: 24,
        volumeSize: 1.25,
        tagFontSize: 14,
      };
    case size > 0.5:
      return {
        imageSize: 60,
        titleSize: 18,
        volumeSize: 1,
        tagFontSize: 13,
      };
    case size > 0.25:
      return {
        imageSize: 50,
        titleSize: 16,
        hideLoop: true,
        volumeSize: 0.75,
        showTags: true,
      };
    case size >= 0:
      return {
        imageSize: 40,
        titleSize: 14,
        hideVolume: true,
        hideLoop: true,
        showTags: true,
      };
    default:
      return {
        imageSize: 50,
        titleSize: 16,
        volumeSize: 1,
        tagFontSize: 13,
      };
  }
}
