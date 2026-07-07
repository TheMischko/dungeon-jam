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

  readonly session = signal<SessionData | null>(null);
  readonly loading = signal<boolean>(false);

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
        });

      return () => sub.unsubscribe();
    });
  }
}
