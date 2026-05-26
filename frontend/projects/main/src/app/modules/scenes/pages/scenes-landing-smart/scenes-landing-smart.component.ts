import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ScenesLandingComponent } from '../scenes-landing/scenes-landing.component';
import { ScenesStore } from '@general/stores/scenes.store';
import { QueryOptions } from '@shared/models/request.model';
import { DialogService } from '../../../../services/dialog.service';
import { CreateSceneModalComponent } from '../../modals/create-scene-modal/create-scene-modal.component';
import { SceneInsertQuery } from '@shared/models/scene.model';

@Component({
  selector: 'app-scenes-landing-smart',
  imports: [ScenesLandingComponent],
  templateUrl: './scenes-landing-smart.component.html',
  styleUrl: './scenes-landing-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenesLandingSmartComponent implements OnInit {
  private readonly scenesStore = inject(ScenesStore);
  private readonly dialogService = inject(DialogService);

  readonly scenes = this.scenesStore.entities;
  readonly scenesLoading = this.scenesStore.loading;
  readonly currentQuery = computed<QueryOptions>(() => {
    return {};
  });

  ngOnInit() {
    this.scenesStore.loadAll(this.currentQuery);
  }

  openInsertSceneModal(): void {
    const dialogRef = this.dialogService.open<
      CreateSceneModalComponent,
      SceneInsertQuery
    >(CreateSceneModalComponent);

    dialogRef.afterClosed$.subscribe((result) => {
      if (result) {
        this.scenesStore.insert(result);
      }
    });
  }
}
