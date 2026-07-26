import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { SessionApiService } from '@general/services/session-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionData } from '@shared/models/session.model';
import { SessionDetailComponent } from '../session-detail/session-detail.component';
import { DialogService } from '../../../../services/dialog.service';
import {
  SessionSceneAssignmentData,
  SessionSceneAssignmentModalComponent,
  SessionSceneAssignmentResult,
} from '../../modals/session-scene-assignment-modal/session-scene-assignment-modal.component';
import { SessionSceneService } from '../../../../services/session-scene.service';
import { of, switchMap } from 'rxjs';
import { ScenesStore } from '@general/stores/scenes.store';

@Component({
  selector: 'app-session-detail-smart',
  imports: [SessionDetailComponent],
  templateUrl: './session-detail-smart.component.html',
  styleUrl: './session-detail-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailSmartComponent {
  readonly sessionId = input.required<string>();

  readonly sessionService = inject(SessionApiService);
  readonly destroyRef = inject(DestroyRef);
  readonly dialogService = inject(DialogService);
  readonly sessionSceneService = inject(SessionSceneService);
  readonly sceneStore = inject(ScenesStore);

  readonly scenesMap = this.sceneStore.entityMap;
  readonly session = signal<SessionData | null>(null);
  readonly loading = signal<boolean>(false);
  readonly scenesContentHiddenMap = signal<Record<string, boolean>>({});

  constructor() {
    effect(() => {
      const sessionId = this.sessionId();
      if (!sessionId) {
        return;
      }

      this.loading.set(true);
      const sub = this.sessionService
        .getById(sessionId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((session) => {
          this.loading.set(false);
          this.session.set(session);
          if (session) {
            this.setScenesContentHiddenMap(session);
          }
        });

      return () => sub.unsubscribe();
    });

    if (!this.sceneStore.entities().length && !this.sceneStore.loading()) {
      this.sceneStore.loadAll({});
    }
  }

  openSceneAssignmentModal(): void {
    const session = this.session();
    if (!session) {
      return;
    }
    const dialogRef = this.dialogService.open<
      SessionSceneAssignmentModalComponent,
      SessionSceneAssignmentResult
    >(SessionSceneAssignmentModalComponent, {
      width: '765px',
      maxWidth: '95vw',
      data: {
        session: session,
      } as SessionSceneAssignmentData,
    });

    dialogRef.afterClosed$
      .pipe(
        switchMap((assignedScenes) => {
          if (!assignedScenes) {
            return of(session);
          }
          return this.sessionSceneService.updateAssignedScenesForSession(
            session,
            assignedScenes
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((updatedSession) => {
        this.session.set(updatedSession);
      });
  }

  setScenesContentHiddenMap(session: SessionData): void {
    const scenes = session.scenes;
    const hiddenMap = scenes.reduce(
      (map, sceneRef, index) => {
        return {
          ...map,
          [sceneRef.sceneId]: index !== 0,
        };
      },
      {} as Record<string, boolean>
    );
    this.scenesContentHiddenMap.set(hiddenMap);
  }
}
