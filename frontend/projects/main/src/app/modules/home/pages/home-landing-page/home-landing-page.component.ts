import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Track } from '@shared/models/track.model';
import { SongsTableComponent } from '../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { SlicePipe } from '@angular/common';
import { PlaylistGridSmartComponent } from '../../../playlist/pages/playlists-landing-page/playlist-grid/playlist-grid-smart/playlist-grid-smart.component';
import { RouterLink } from '@angular/router';
import { routesStrings } from '../../../../routes-strings';
import { libraryRouteStrings } from '../../../library/library-route-strings';

@Component({
  selector: 'app-home-landing-page',
  imports: [
    SongsTableComponent,
    SlicePipe,
    PlaylistGridSmartComponent,
    RouterLink,
  ],
  templateUrl: './home-landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-landing-page.component.scss',
})
export class HomeLandingPageComponent {
  readonly tracks = input<Track[]>([]);
  readonly tracksLoading = input<boolean>(false);
  readonly playingTrackId = input<string | null>(null);
  readonly showPlaylists = input<boolean>(false);
  readonly showTracks = input<boolean>(false);

  readonly playTrack = output<Track>();
  readonly pauseTrack = output<void>();

  readonly noData = computed(() => {
    return !(this.showPlaylists() || this.showTracks());
  });
  readonly libraryLink = [
    `/${routesStrings.library}/${libraryRouteStrings.library}`,
  ];
}
