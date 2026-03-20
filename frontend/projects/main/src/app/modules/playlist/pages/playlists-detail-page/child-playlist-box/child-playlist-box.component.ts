import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';

@Component({
  selector: 'app-child-playlist-box',
  imports: [],
  templateUrl: './child-playlist-box.component.html',
  styleUrl: './child-playlist-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildPlaylistBoxComponent {
  readonly playlist = input.required<Playlist>();

  readonly clicked = output<Playlist>();
}
