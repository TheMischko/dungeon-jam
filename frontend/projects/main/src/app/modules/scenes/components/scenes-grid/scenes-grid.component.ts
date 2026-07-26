import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { GridItemComponent } from '../../../../components/grid/grid-item/grid-item.component';
import { iconSet, volumeIconSet } from '@general/icons/icons';
import { Tag } from '@shared/models/tag.model';
import { LucideDynamicIcon } from '@lucide/angular';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import {
  AllSizeGridItemConfigs,
  GridItemSizeConfig,
} from '../../../../models/grid.model';
import { GridControlsComponent } from '../../../../components/grid/grid-controls/grid-controls.component';

@Component({
  selector: 'app-scenes-grid',
  imports: [
    GridItemComponent,
    LucideDynamicIcon,
    MatCheckbox,
    GridControlsComponent,
  ],
  templateUrl: './scenes-grid.component.html',
  styleUrl: './scenes-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenesGridComponent {
  readonly scenes = input.required<Scene[]>();
  readonly loading = input<boolean>();
  readonly sceneImageMap = input<Record<string, string | null>>();
  readonly tagsMap = input<Record<string, Tag>>({});
  readonly playingSceneId = input<string>();
  readonly itemPlayable = input<boolean>(true);
  readonly itemSelectable = input<boolean>(false);
  readonly itemDetailNavigation = input<boolean>(true);
  readonly showControls = input<boolean>(true);
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly availableSizes = input<GridItemSizeConfig[]>(AllSizeGridItemConfigs);
  readonly currentSizeIndex = input<number>(0);
  readonly initialSelection = input<Scene[]>();

  readonly showDetail = output<Scene>();
  readonly playScene = output<Scene>();
  readonly pauseScene = output<Scene>();
  readonly sizeChange = output<number>();
  readonly search = output<string>();
  readonly selected = output<Scene[]>();

  readonly maxSizeIndex = computed<number>(() => {
    return Math.max((this.availableSizes().length - 1) * 25, 0);
  });

  readonly currentSizeValue = computed<number>(() => {
    return this.currentSizeIndex() * 25;
  });

  readonly computedSizeConfig = computed<GridItemSizeConfig>(() => {
    const index = Math.min(
      Math.max(0, this.currentSizeIndex()),
      this.availableSizes().length - 1
    );
    return this.availableSizes()[index] || this.sizeConfig();
  });

  readonly selectedItems = signal<Scene[]>([]);

  constructor() {
    effect(() => {
      const initialSelection = this.initialSelection();
      if (initialSelection) {
        this.selectedItems.set(initialSelection);
      }
    });
  }

  protected sizeInput(value: number) {
    const index = Math.round(value * 100);
    const clampedIndex = Math.max(Math.min(index, this.maxSizeIndex() - 1), 0);
    this.sizeChange.emit(clampedIndex);
  }

  isSelected(scene: Scene): boolean {
    return this.selectedItems().some((selected) => selected.id === scene.id);
  }

  protected itemSelected(scene: Scene, event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedItems.update((selection) => [...selection, scene]);
    } else {
      this.selectedItems.update((selection) =>
        selection.filter((item) => item.id !== scene.id)
      );
    }
    this.selected.emit(this.selectedItems());
  }

  tagsNameMap = computed(() => {
    const tagsMap = this.tagsMap();
    return Object.keys(this.tagsMap()).reduce(
      (map, tagId) => {
        const tag = tagsMap[tagId];
        return {
          ...map,
          [tag.title]: tag,
        };
      },
      {} as Record<string, Tag>
    );
  });

  readonly SceneIcon = iconSet.AudioWaveIcon;
  readonly PlayingIcon = volumeIconSet.NormalIcon;
  readonly PlayIcon = iconSet.PlayIcon;
  readonly PauseIcon = iconSet.PauseIcon;

  getSceneImage(scene: Scene): string | null {
    const imageMap = this.sceneImageMap();
    if (!imageMap) {
      return null;
    }
    return imageMap[scene.id] ?? null;
  }

  getSceneTags(scene: Scene): Tag[] {
    return scene.tags
      .map((tag) => {
        return this.tagsNameMap()?.[tag];
      })
      .filter((t) => !!t);
  }

  protected onOverlayButtonClick(event: PointerEvent, scene: Scene) {
    if (!this.itemPlayable()) {
      return;
    }
    event.stopPropagation();
    const playingId = this.playingSceneId();
    if (playingId && playingId === scene.id) {
      this.pauseScene.emit(scene);
      return;
    }
    if (!scene.playlistId && !scene.ambience.length) {
      return;
    }
    this.playScene.emit(scene);
  }

  navigateToDetail(scene: Scene): void {
    if (!this.itemDetailNavigation()) {
      return;
    }
    this.showDetail.emit(scene);
  }
}
