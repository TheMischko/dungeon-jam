import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-sessions-landing',
  imports: [MatButton],
  templateUrl: './sessions-landing.component.html',
  styleUrl: './sessions-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsLandingComponent {
  readonly loading = input<boolean>(false);
  readonly sessions = input<SessionData[]>([]);

  readonly createSession = output<void>();
}
