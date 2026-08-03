import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { SceneConsoleSmartComponent } from '../../components/scene-console-smart/scene-console-smart.component';

@Component({
  selector: 'app-scene-detail',
  imports: [SceneConsoleSmartComponent],
  templateUrl: './scene-detail.component.html',
  styleUrl: './scene-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneDetailComponent {
  readonly scene = input.required<Scene>();
  readonly deleteScene = output<Scene>();
}
