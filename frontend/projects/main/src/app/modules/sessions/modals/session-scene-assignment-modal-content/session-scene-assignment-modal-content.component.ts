import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { Scene } from '@shared/models/scene.model';
import { TableComponent } from '../../../../components/table/table.component';
import {
  TableColumnConfiguration,
  TableUniquenessFn,
} from '../../../../models/table.model';

@Component({
  selector: 'app-session-scene-assignment-modal-content',
  imports: [TableComponent],
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
}
