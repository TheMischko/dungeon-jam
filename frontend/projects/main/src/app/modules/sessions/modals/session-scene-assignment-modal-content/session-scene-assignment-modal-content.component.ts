import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { Scene } from '@shared/models/scene.model';
import {
  TableColumnConfiguration,
  TableUniquenessFn,
} from '../../../../models/table.model';
import { AssignedSceneBoxComponent } from '../../components/assigned-scene-box/assigned-scene-box.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ScenesGridSmartComponent } from '../../../scenes/components/scenes-grid-smart/scenes-grid-smart.component';
import {
  GridItemSizeConfig,
  MediumSizeGridItemConfig,
  SmallSizeGridItemConfig,
} from '../../../../models/grid.model';

@Component({
  selector: 'app-session-scene-assignment-modal-content',
  imports: [
    AssignedSceneBoxComponent,
    CdkDropList,
    CdkDrag,
    ScenesGridSmartComponent,
  ],
  templateUrl: './session-scene-assignment-modal-content.component.html',
  styleUrl: './session-scene-assignment-modal-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSceneAssignmentModalContentComponent {
  readonly session = input.required<SessionData>();
  readonly allScenes = input<Scene[]>([]);
  readonly assignedScenes = input<Scene[]>([]);
  readonly currentSelection = input<Scene[]>([]);

  readonly selectionChanged = output<Scene[]>();
  readonly unselectScene = output<Scene>();
  readonly sceneMoved = output<{ prevIndex: number; currentIndex: number }>();

  readonly availableSceneSizes: GridItemSizeConfig[] = [
    SmallSizeGridItemConfig,
    MediumSizeGridItemConfig,
  ];

  readonly uniqueSceneFn: TableUniquenessFn<Scene> = (a: Scene, b: Scene) =>
    a.id === b.id;

  readonly config: TableColumnConfiguration<Scene> = {
    name: {
      title: 'Name',
      isDefaultSortColumn: true,
    },
    dateUpdated: {
      title: 'Date Updated',
      customValueFn: (scene: Scene) =>
        scene?.dateUpdated?.toDateString?.() ?? '',
    },
    dateCreated: {
      title: 'Date Created',
      customValueFn: (scene: Scene) =>
        scene?.dateCreated?.toDateString?.() ?? '',
    },
  };

  protected emitSceneMoved(event: CdkDragDrop<Scene, unknown>) {
    this.sceneMoved.emit({
      prevIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
