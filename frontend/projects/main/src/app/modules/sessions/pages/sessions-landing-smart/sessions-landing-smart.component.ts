import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { SessionStore } from '@general/stores/session.store';
import { SessionsLandingComponent } from '../sessions-landing/sessions-landing.component';
import { DialogService } from '../../../../services/dialog.service';
import {
  EditSessionModalComponent,
  EditSessionModalResult,
} from '../../modals/edit-session-modal/edit-session-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionInsertQuery } from '@shared/models/session.model';

@Component({
  selector: 'app-sessions-landing-smart',
  imports: [SessionsLandingComponent],
  templateUrl: './sessions-landing-smart.component.html',
  styleUrl: './sessions-landing-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsLandingSmartComponent {
  private readonly sessionStore = inject(SessionStore);
  private readonly dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  openNewSessionDialog(): void {
    const dialog = this.dialogService.open<
      EditSessionModalComponent,
      EditSessionModalResult
    >(EditSessionModalComponent, {});

    dialog.afterClosed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === null) {
          return;
        }

        this.sessionStore.insert({
          name: result!.name,
          description: result?.description,
          dateOfSession: result?.dateOfSession,
        } as SessionInsertQuery);
      });
  }
}
