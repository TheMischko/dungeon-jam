import { Component, computed, input, output, TemplateRef, viewChild } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import {
  CollapsibleSectionComponent
} from '@general/components/display/collapsible-section/collapsible-section.component';
import { ChildPlaylistBoxComponent } from './child-playlist-box/child-playlist-box.component';

@Component({
  selector: 'app-playlists-detail-page',
  imports: [
    SongsTableComponent,
    PlayPauseButtonComponent,
    MatButton,
    LucideAngularModule,
    SwitchComponent,
    RouterLink,
    CollapsibleSectionComponent,
    ChildPlaylistBoxComponent,
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
  readonly parentPlaylist = input<Playlist | null>(null);
  readonly childrenPlaylists = input<Playlist[]>([]);

  readonly playPlaylist = output();
  readonly playTrack = output<Track>();
  readonly pause = output();
  readonly queryChange = output<QueryOptions>();
  readonly openAddTracks = output<void>();
  readonly includeChildren = output<boolean>();

  readonly parentDetailRoute = computed(() => {
    const parent = this.parentPlaylist();
    if (!parent) {
      return null;
    }
    return ['../', parent.id];
  });

  readonly childrenSectionConfig = computed(() => {
    if(!this.childrenPlaylists() || this.childrenPlaylists().length === 0) {
      return [] as {value: Playlist[], title: string, template: TemplateRef<{ $implicit: Playlist[]}>}[];
    }
    return [{
      value: this.childrenPlaylists(),
      title: 'Child Playlists',
      template: this.childrenSectionTemplate(),
    }]
  });


  readonly childrenSectionTemplate = viewChild.required<TemplateRef<{$implicit: Playlist[]}>>('childrenTemplate')

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
