import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ScenesStore } from '@general/stores/scenes.store';
import { QueryOptions } from '@shared/models/request.model';
import { ScenesGridComponent } from '../scenes-grid/scenes-grid.component';
import { ImageApiService } from '@general/services/image-api.service';
import { Scene } from '@shared/models/scene.model';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { TagsStore } from '@general/stores/tags.store';
import { Router } from '@angular/router';
import { routesStrings } from '../../../../routes-strings';
import { scenesRouteStrings } from '../../scenes-route-strings';
import { PlaybackService } from '../../../../services/playback.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ScenePlayerService } from '../../../../services/scene-player.service';
import {
  AllSizeGridItemConfigs,
  GridItemSizeConfig,
} from '../../../../models/grid.model';
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PlaylistStore } from '@general/stores/playlist.store';

@Component({
  selector: 'app-scenes-grid-smart',
  imports: [ScenesGridComponent],
  templateUrl: './scenes-grid-smart.component.html',
  styleUrl: './scenes-grid-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenesGridSmartComponent implements OnInit {
  private readonly scenesStore = inject(ScenesStore);
  private readonly imageApiService = inject(ImageApiService);
  private readonly tagsStore = inject(TagsStore);
  private readonly router = inject(Router);
  private readonly playbackService = inject(PlaybackService);
  private readonly scenePlayerService = inject(ScenePlayerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playlistStore = inject(PlaylistStore);

  readonly itemPlayable = input<boolean>(true);
  readonly itemSelectable = input<boolean>(false);
  readonly itemDetailNavigation = input<boolean>(true);
  readonly showControls = input<boolean>(true);
  readonly availableSizes = input<GridItemSizeConfig[]>(AllSizeGridItemConfigs);
  readonly initialSizeIndex = input<number>(0);
  readonly initialSelection = input<Scene[]>();
  readonly reorderingEnabled = input<boolean>(false);

  readonly selected = output<Scene[]>();

  readonly scenesLoading = this.scenesStore.loading;
  readonly scenes = signal<Scene[]>([]);
  readonly imageMap = signal<Record<string, string | null>>({});
  readonly tagMap = this.tagsStore.entityMap;
  readonly searchFilter = signal<string>('');
  readonly currentSizeIndex = signal<number>(0);
  readonly currentQuery = computed<QueryOptions>(() => {
    return {
      search: this.searchFilter(),
    };
  });
  readonly sizeConfig = computed<GridItemSizeConfig>(() => {
    const sizes = this.availableSizes();
    const index = this.currentSizeIndex();
    return sizes[index] ?? sizes[0];
  });
  readonly playingSceneId = toSignal(
    this.playbackService.playback$.pipe(
      map((playback) => (playback.isPlaying ? playback.sceneId : undefined))
    )
  );

  constructor() {
    effect(() => {
      this.currentSizeIndex.set(this.initialSizeIndex());
    });

    effect(() => {
      const scenes = this.scenesStore.entities();
      const orderMap = this.scenesStore.latestOrderMap();
      this.scenes.set(
        scenes.sort((a, b) => this.sortScenesByDisplayOrder(orderMap, a, b))
      );
      if (!scenes?.length) {
        return;
      }
      const imageSub = this.updateImageMap(scenes).subscribe();

      return () => {
        imageSub?.unsubscribe();
      };
    });
  }

  ngOnInit() {
    this.scenesStore.loadAll(this.currentQuery);
    if (!this.tagsStore.initialized) {
      this.tagsStore.loadAll({});
    }

    if (
      this.playlistStore.entities().length === 0 &&
      !this.playlistStore.loading()
    ) {
      this.playlistStore.load({});
    }
  }

  handleSizeChange(newIndex: number) {
    const maxIndex = this.availableSizes().length - 1;
    if (newIndex < 0 || newIndex > maxIndex) {
      return;
    }
    this.currentSizeIndex.set(newIndex);
  }

  async navigateToDetail(scene: Scene): Promise<void> {
    await this.router.navigate([
      routesStrings.scenes,
      scenesRouteStrings.sceneDetail,
      scene.id,
    ]);
  }

  private updateImageMap(scenes: Scene[]): Observable<void> {
    const imageRequests = scenes.map((scene) => {
      if (!scene.imageUrl) {
        if (scene.playlistId) {
          return this.usePlaylistImage(scene);
        }
        return this.getNoImageSceneMapRecord(scene);
      }

      return this.imageApiService.fetchImage(scene.imageUrl).pipe(
        map((imageUrl) => ({
          sceneId: scene.id,
          imageUrl,
        }))
      );
    });

    return forkJoin(imageRequests).pipe(
      tap((responses) => {
        const imageMap = responses.reduce(
          (map, record) => {
            return {
              ...map,
              [record.sceneId]: record.imageUrl,
            };
          },
          {} as Record<string, string | null>
        );
        this.imageMap.set(imageMap);
      }),
      map(() => void 0)
    );
  }

  protected playScene(scene: Scene) {
    this.scenePlayerService
      .playScene(scene.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected stopScene(scene: Scene) {
    this.scenePlayerService.stopScene(scene);
  }

  private sortScenesByDisplayOrder(
    orderMap: Map<string, DisplayOrder>,
    a: Scene,
    b: Scene
  ): number {
    const orderA = orderMap.get(a.id)?.order ?? 0;
    const orderB = orderMap.get(b.id)?.order ?? 0;
    return orderA - orderB;
  }

  protected reorderScene(event: CdkDragDrop<Scene[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const scenes = this.scenes();
    const item = scenes[event.previousIndex];
    if (!item) {
      return;
    }

    const anchor = scenes[event.currentIndex];

    this.scenesStore.changeRelativeOrder({
      entityId: item.id,
      anchorEntityId: anchor.id,
      placement: DisplayOrderPlacement.BEFORE,
    });
  }

  private getNoImageSceneMapRecord(scene: Scene) {
    return of({
      sceneId: scene.id,
      imageUrl: null,
    });
  }

  private usePlaylistImage(scene: Scene) {
    if (!scene.playlistId) {
      return this.getNoImageSceneMapRecord(scene);
    }
    const playlistMap = this.playlistStore.entityMap();
    const playlist = playlistMap[scene.playlistId];
    if (!playlist || !playlist.imageUrl) {
      return this.getNoImageSceneMapRecord(scene);
    }
    return this.imageApiService.fetchImage(playlist.imageUrl).pipe(
      map((imageUrl) => ({
        sceneId: scene.id,
        imageUrl,
      }))
    );
  }
}
