import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SessionsGridSmartComponent } from '../../components/sessions-grid-smart/sessions-grid-smart.component';
import { GridSizePreset } from '../../../../models/grid.model';

@Component({
  selector: 'app-sessions-landing',
  imports: [MatButton, SessionsGridSmartComponent],
  templateUrl: './sessions-landing.component.html',
  styleUrl: './sessions-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsLandingComponent {
  readonly createSession = output<void>();

  readonly defaultSizeIndex = GridSizePreset.Big;
}
