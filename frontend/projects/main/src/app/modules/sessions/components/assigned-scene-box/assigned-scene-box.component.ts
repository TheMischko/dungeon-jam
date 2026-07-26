import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon } from '@lucide/angular';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-assigned-scene-box',
  imports: [MatCheckbox, LucideDynamicIcon, CdkDragHandle],
  templateUrl: './assigned-scene-box.component.html',
  styleUrl: './assigned-scene-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignedSceneBoxComponent {
  readonly scene = input.required<Scene>();
  readonly order = input<number>();

  readonly unselected = output<void>();

  readonly DragIcon = actionsIconSet.DragIcon;
}
