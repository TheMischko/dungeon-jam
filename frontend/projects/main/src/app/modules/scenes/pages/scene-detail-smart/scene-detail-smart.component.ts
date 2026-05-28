import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ScenesStore } from '@general/stores/scenes.store';
import { Scene } from '@shared/models/scene.model';
import { SceneDetailComponent } from '../scene-detail/scene-detail.component';
import { LoaderComponent } from '@general/components/display/loader/loader.component';

@Component({
  selector: 'app-scene-detail-smart',
  imports: [SceneDetailComponent, LoaderComponent],
  templateUrl: './scene-detail-smart.component.html',
  styleUrl: './scene-detail-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneDetailSmartComponent implements OnInit {
  readonly scenesStore = inject(ScenesStore);

  readonly sceneId = input.required<string>();

  readonly scene = signal<Scene | undefined>(undefined);

  constructor() {
    effect(() => {
      const scenesMap = this.scenesStore.entityMap();
      this.scene.set(scenesMap[this.sceneId()]);
    });
  }

  ngOnInit() {
    if (!this.scenesStore.entities().length && !this.scenesStore.loading()) {
      this.scenesStore.loadAll({});
    }
  }
}
