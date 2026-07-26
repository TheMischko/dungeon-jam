import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionData } from '@shared/models/session.model';
import { SessionSceneService } from '../../../../services/session-scene.service';
import { QueryOptions } from '@shared/models/request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Scene } from '@shared/models/scene.model';
import { MatButton } from '@angular/material/button';
import { SessionSceneAssignmentModalContentComponent } from '../session-scene-assignment-modal-content/session-scene-assignment-modal-content.component';
import { SceneApiService } from '@general/services/scene-api.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-session-scene-assignment-modal',
  imports: [MatButton, SessionSceneAssignmentModalContentComponent],
  templateUrl: './session-scene-assignment-modal.component.html',
  styleUrl: './session-scene-assignment-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSceneAssignmentModalComponent {
  private readonly sessionSceneService = inject(SessionSceneService);
  private readonly sceneApi = inject(SceneApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef: MatDialogRef<
    SessionSceneAssignmentModalComponent,
    SessionSceneAssignmentResult
  > = inject(MatDialogRef);
  private readonly data: SessionSceneAssignmentData = inject(MAT_DIALOG_DATA);

  readonly session: SessionData = this.data.session;

  readonly queryOptions = signal<QueryOptions>({});
  readonly loading = signal<boolean>(false);
  readonly allScenes = signal<Scene[]>([]);
  readonly assignedScenes = signal<Scene[]>([]);
  readonly currentSelection = signal<Scene[]>([]);

  constructor() {
    if (this.session) {
      this.sessionSceneService
        .getAssignedScenesForSession(this.session)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((scenes) => {
          this.assignedScenes.set(scenes);
          this.currentSelection.set(scenes);
        });
    }

    effect(() => {
      if (!this.session) {
        return;
      }

      this.loading.set(true);
      const sub = this.sceneApi
        .getAll(this.queryOptions())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (scenes) => {
            this.allScenes.set(scenes);
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
          },
        });

      return () => {
        sub.unsubscribe();
        this.loading.set(false);
      };
    });
  }

  save(): void {
    this.dialogRef.close(this.currentSelection());
  }

  cancel(): void {
    this.dialogRef.close();
  }

  updateSelection(scenes: Scene[]): void {
    this.currentSelection.set(scenes);
  }

  unassignScene(scene: Scene): void {
    this.currentSelection.update((current) =>
      current.filter((s) => s.id !== scene.id)
    );
  }

  reorderScene(change: { prevIndex: number; currentIndex: number }): void {
    this.currentSelection.update((selection) => {
      const selectionCopy = [...selection];
      moveItemInArray(selectionCopy, change.prevIndex, change.currentIndex);
      return selectionCopy;
    });
  }
}

export type SessionSceneAssignmentData = {
  session: SessionData;
};

export type SessionSceneAssignmentResult = Scene[];
