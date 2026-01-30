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
import { actionsIconSet } from '@general/icons/icons';
import { MatButton } from '@angular/material/button';
import { LucideAngularModule } from 'lucide-angular';
import { QueryOptions } from '@shared/models/request.model';
import { SwitchComponent } from '@general/components/controls/switch/switch.component';

@Component({
  selector: 'app-playlists-detail-page',
  imports: [
    SongsTableComponent,
    PlayPauseButtonComponent,
    MatButton,
    LucideAngularModule,
    SwitchComponent,
  ],
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
  readonly queryChange = output<QueryOptions>();
  readonly openAddTracks = output<void>();
  readonly includeChildren = output<boolean>();

  readonly buttonType = ButtonType.Flat;
  readonly buttonSize: ButtonSize = 'large';
  readonly playButtonState = computed<'play' | 'pause'>(() => {
    return this.playlistPlaying() ? 'pause' : 'play';
  });
  readonly addTracksIcon = actionsIconSet.AddIcon;

  playPauseClicked(state: 'play' | 'pause') {
    if (state === 'play') {
      return this.playPlaylist.emit();
    }
    this.pause.emit();
  }

  protected toggleIncludeChildren(include: boolean) {
    this.includeChildren.emit(include);
  }
}
