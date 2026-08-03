import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ScenesStore } from '@general/stores/scenes.store';
import { SceneApiService } from '@general/services/scene-api.service';
import { Scene } from '@shared/models/scene.model';
import { SceneDetailComponent } from '../scene-detail/scene-detail.component';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { DialogService } from '../../../../services/dialog.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { routesStrings } from '../../../../routes-strings';

@Component({
  selector: 'app-scene-detail-smart',
  imports: [SceneDetailComponent, LoaderComponent],
  templateUrl: './scene-detail-smart.component.html',
  styleUrl: './scene-detail-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneDetailSmartComponent implements OnInit {
  readonly scenesStore = inject(ScenesStore);
  readonly sceneApiService = inject(SceneApiService);
  readonly dialogService = inject(DialogService);
  readonly router = inject(Router);
  readonly destroyRef = inject(DestroyRef);

  readonly sceneId = input.required<string>();

  readonly scene = signal<Scene | undefined>(undefined);

  constructor() {
    effect(() => {
      const scenesMap = this.scenesStore.entityMap();
      const scene = scenesMap[this.sceneId()];
      this.scene.set(scene);
    });
  }

  ngOnInit() {
    if (!this.scenesStore.entities().length && !this.scenesStore.loading()) {
      this.scenesStore.loadAll({});
    }
  }

  openDeleteSceneModal(): void {
    const scene = this.scene();
    if (!scene) {
      return;
    }

    const dialogRef = this.dialogService.open<
      ConfirmationDialogComponent,
      boolean
    >(ConfirmationDialogComponent, {
      data: {
        title: 'Delete scene',
        message: `Are you sure you want to delete scene "${scene.name}"?`,
        confirmText: 'Delete',
        dismissText: 'Cancel',
      } satisfies ConfirmationDialogData,
    });

    dialogRef.afterClosed$
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(false);
          }
          return this.sceneApiService.delete(scene.id).pipe(map(() => true));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((deleted) => {
        if (deleted) {
          this.scenesStore.deleteScene(scene.id);
          this.router.navigate(['/', routesStrings.scenes]);
        }
      });
  }
}
