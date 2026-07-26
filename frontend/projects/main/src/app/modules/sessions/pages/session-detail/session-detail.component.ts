import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { MatButton } from '@angular/material/button';
import { SceneConsoleSmartComponent } from '../../../scenes/components/scene-console-smart/scene-console-smart.component';
import { Scene } from '@shared/models/scene.model';

@Component({
  selector: 'app-session-detail',
  imports: [LoaderComponent, MatButton, SceneConsoleSmartComponent],
  templateUrl: './session-detail.component.html',
  styleUrl: './session-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  readonly session = input<SessionData | null>(null);
  readonly loading = input<boolean>(false);
  readonly scenesMap = input<Record<string, Scene>>({});
  readonly scenesContentHiddenMap = input<Record<string, boolean>>();

  readonly changeScenes = output<void>();

  isSceneContentHidden(scene: Scene): boolean {
    return this.scenesContentHiddenMap()?.[scene.id] ?? false;
  }
}
