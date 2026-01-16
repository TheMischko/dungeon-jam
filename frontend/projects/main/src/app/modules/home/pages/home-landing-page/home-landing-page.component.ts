import { Component, input, output } from '@angular/core'; import { Track } from
'@shared/models/track.model'; import { SongsTableComponent } from
'../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { SlicePipe } from '@angular/common'; import { PlaylistGridSmartComponent
} from
'../../../playlist/pages/playlists-landing-page/playlist-grid/playlist-grid-smart/playlist-grid-smart.component';

@Component({
  selector: 'app-home-landing-page',
  imports: [ SongsTableComponent, SlicePipe, PlaylistGridSmartComponent, ],
  templateUrl: './home-landing-page.component.html',
  styleUrl: './home-landing-page.component.scss', })
export class HomeLandingPageComponent {
  readonly tracks = input<Track[]>([]);
  readonly tracksLoading = input<boolean>(false);
  readonly playingTrackId = input<string | null>(null);
  readonly playTrack = output<Track>();
  readonly pauseTrack = output<void>();
}
