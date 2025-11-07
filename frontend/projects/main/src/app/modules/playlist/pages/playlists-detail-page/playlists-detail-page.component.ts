import { Component, computed, input, output } from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';
import { Track } from '@shared/models/track.model';
import { SongsTableComponent } from '../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import {
  ButtonType,
  ButtonSize,
} from '../../../../../../../general/models/button.model';
import { ActionsMenuConfig } from '@general/components/display/actions-menu/actions-menu.component';

@Component({
  selector: 'app-playlists-detail-page',
  imports: [SongsTableComponent, PlayPauseButtonComponent],
  templateUrl: './playlists-detail-page.component.html',
  styleUrl: './playlists-detail-page.component.scss',
})
export class PlaylistsDetailPageComponent {
  readonly playlist = input.required<Playlist | null>();
  readonly tracks = input.required<Track[]>();
  readonly playlistPlaying = input<boolean>(false);
  readonly playingTrackId = input<string | undefined>();
  readonly songActionsMenuConfig = input<ActionsMenuConfig<Track, Playlist>[]>(
    [],
  );

  readonly playPlaylist = output();
  readonly playTrack = output<Track>();
  readonly pause = output();
  readonly search = output<string>();

  readonly buttonType = ButtonType.Flat;
  readonly buttonSize: ButtonSize = 'large';
  readonly playButtonState = computed<'play' | 'pause'>(() => {
    return this.playlistPlaying() ? 'pause' : 'play';
  });

  playPauseClicked(state: 'play' | 'pause') {
    if (state === 'play') {
      return this.playPlaylist.emit();
    }
    this.pause.emit();
  }
}
