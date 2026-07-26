import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-child-playlist-actions',
  imports: [
    MatButton,
  ],
  templateUrl: './child-playlist-actions.component.html',
  styleUrl: './child-playlist-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildPlaylistActionsComponent {
  readonly createNewChildPlaylist = output<void>();
}
