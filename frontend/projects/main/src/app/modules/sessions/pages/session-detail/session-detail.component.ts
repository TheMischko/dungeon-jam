import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';

@Component({
  selector: 'app-session-detail',
  imports: [LoaderComponent],
  templateUrl: './session-detail.component.html',
  styleUrl: './session-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent {
  readonly session = input<SessionData | null>(null);
  readonly loading = input<boolean>(false);
}
