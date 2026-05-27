import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { GridItemComponent } from '../../../../components/grid/grid-item/grid-item.component';
import { iconSet } from '@general/icons/icons';
import { Tag } from '@shared/models/tag.model';

@Component({
  selector: 'app-scenes-grid',
  imports: [GridItemComponent],
  templateUrl: './scenes-grid.component.html',
  styleUrl: './scenes-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenesGridComponent {
  readonly scenes = input.required<Scene[]>();
  readonly loading = input<boolean>();
  readonly sceneImageMap = input<Record<string, string | null>>();
  readonly tagsMap = input<Record<string, Tag>>({});

  readonly showDetail = output<Scene>();

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
}
