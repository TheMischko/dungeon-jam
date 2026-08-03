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
import { map, of, switchMap } from 'rxjs';
import { ScenesStore } from '@general/stores/scenes.store';
import { SessionStore } from '@general/stores/session.store';
import { Router } from '@angular/router';
import {
  EditSessionModalComponent,
  EditSessionModalData,
  EditSessionModalResult,
} from '../../modals/edit-session-modal/edit-session-modal.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../../../components/dialog/confirmation-dialog/confirmation-dialog.component';

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
  readonly sessionStore = inject(SessionStore);
  readonly router = inject(Router);
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

  openEditSessionModal(): void {
    const session = this.session();
    if (!session) {
      return;
    }

    const dialogRef = this.dialogService.open<
      EditSessionModalComponent,
      EditSessionModalResult
    >(EditSessionModalComponent, {
      data: {
        sessionId: session.id,
        formData: {
          name: session.name,
          description: session.description ?? null,
          dateOfSession: session.dateOfSession
            ? new Date(session.dateOfSession)
            : null,
        },
      } satisfies EditSessionModalData,
    });

    dialogRef.afterClosed$
      .pipe(
        switchMap((result) => {
          if (!result) {
            return of(null);
          }
          return this.sessionService.update({
            id: session.id,
            name: result.name,
            description: result.description,
            dateOfSession: result.dateOfSession,
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((updatedSession) => {
        if (updatedSession) {
          this.session.set(updatedSession);
        }
      });
  }

  openDeleteSessionModal(): void {
    const session = this.session();
    if (!session) {
      return;
    }

    const dialogRef = this.dialogService.open<
      ConfirmationDialogComponent,
      boolean
    >(ConfirmationDialogComponent, {
      data: {
        title: 'Delete session',
        message: `Are you sure you want to delete session "${session.name}"?`,
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
          return this.sessionService.delete(session.id).pipe(map(() => true));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((deleted) => {
        if (deleted) {
          this.sessionStore.deleteSession(session.id);
          this.router.navigate(['/sessions']);
        }
      });
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
