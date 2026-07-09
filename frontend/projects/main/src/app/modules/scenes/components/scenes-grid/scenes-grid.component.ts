import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { GridItemComponent } from '../../../../components/grid/grid-item/grid-item.component';
import { iconSet, volumeIconSet } from '@general/icons/icons';
import { Tag } from '@shared/models/tag.model';
import { LucideAngularModule } from 'lucide-angular';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-scenes-grid',
  imports: [GridItemComponent, LucideAngularModule, MatCheckbox],
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

  readonly showDetail = output<Scene>();
  readonly playScene = output<Scene>();
  readonly pauseScene = output<Scene>();

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

  getSceneImages(scene: Scene): string[] {
    const imageMap = this.sceneImageMap();
    if (!imageMap) {
      return [];
    }
    const image = imageMap[scene.id];
    return image ? [image] : [];
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
