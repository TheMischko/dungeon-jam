import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { MatButton } from '@angular/material/button';
import { GridItemComponent } from '../../../../components/grid/grid-item/grid-item.component';
import { iconSet } from '@general/icons/icons';

@Component({
  selector: 'app-sessions-landing',
  imports: [MatButton, GridItemComponent],
  templateUrl: './sessions-landing.component.html',
  styleUrl: './sessions-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsLandingComponent {
  readonly loading = input<boolean>(false);
  readonly sessions = input<SessionData[]>([]);

  readonly sessionClick = output<SessionData>();
  readonly createSession = output<void>();

  readonly SessionIcon = iconSet.SessionIcon;
}
