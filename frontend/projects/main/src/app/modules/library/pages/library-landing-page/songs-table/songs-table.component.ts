import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { Track } from '@shared/models/track.model';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { MatIconButton } from '@angular/material/button';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import {
  MatMenu,
  MatMenuTrigger,
  MenuCloseReason,
} from '@angular/material/menu';
import {
  ActionsMenuComponent,
  ActionsMenuBaseConfig,
  ActionsMenuConfig,
  ActionsMenuDataConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { PlaylistStore } from '@general/stores/playlist.store';
import { Playlist } from '@shared/models/playlist.model';
import { SortDirection } from '@shared/models/common.model';

@Component({
  selector: 'app-songs-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    LucideAngularModule,
    MatIconButton,
    TrackDurationPipe,
    SearchBarComponent,
    IconButtonComponent,
    MatMenuTrigger,
    MatMenu,
    ActionsMenuComponent,
  ],
  templateUrl: './songs-table.component.html',
  styleUrl: './songs-table.component.scss',
})
export class SongsTableComponent implements OnInit {
  readonly playlistsStore = inject(PlaylistStore);

  readonly tracks = input<Track[]>([]);
  readonly playingTrackId = input<string | null>();

  readonly playTrack = output<Track>();
  readonly pauseTrack = output();
  readonly search = output<string>();

  readonly activeRow = signal<Track | null>(null);
  readonly showPlaylists = signal<boolean>(false);

  readonly displayedColumns = [
    'play',
    'title',
    'author',
    'duration',
    'actions',
  ];

  readonly defaultActions: ActionsMenuBaseConfig<Track>[] = [
    {
      text: 'Play next',
      icon: iconSet.PlayNextIcon,
      onSelected: (track: Track) => this.playNext(track),
    },
    {
      text: 'Add to playlist',
      icon: actionsIconSet.AddIcon,
      onSelected: () => this.addToPlaylist(),
      keepOpen: true,
    },
    {
      text: 'Delete',
      icon: actionsIconSet.DeleteIcon,
      onSelected: (track: Track) => this.deleteTrack(track),
    },
  ];

  readonly menuPickActions = computed(() => {
    return this.playlistsStore
      .entities()
      .map<ActionsMenuDataConfig<Track, Playlist>>((playlist) => {
        console.log(playlist);
        return {
          text: playlist.name,
          data: playlist,
          keepOpen: false,
          onSelected: (
            track: Track,
            config: ActionsMenuDataConfig<Track, Playlist>,
          ) => {
            this.playlistsStore.addNewTracks({
              [config.data!.id]: [track!.id],
            });
            this.showPlaylists.set(false);
          },
        };
      });
  });

  readonly menuActions = computed<ActionsMenuConfig<Track, Playlist>[]>(() => {
    if (this.showPlaylists()) {
      return this.menuPickActions();
    }
    return this.defaultActions;
  });

  ngOnInit() {
    this.playlistsStore.load({
      sortBy: 'title',
      sortDirection: SortDirection.ASC,
    });
  }

  hoverStart(track: Track) {
    this.activeRow.set(track);
  }

  hoverEnd(track: Track) {
    if (this.activeRow()?.id === track.id) {
      this.activeRow.set(null);
    }
  }

  isActiveRow(track: Track): boolean {
    return this.activeRow()?.id === track.id;
  }

  isTrackPlaying(track: Track) {
    if (!this.playingTrackId()) {
      return false;
    }
    return this.playingTrackId() === track.id;
  }

  play(track: Track) {
    this.playTrack.emit(track);
  }

  pause() {
    this.pauseTrack.emit();
  }

  readonly PlayIcon = iconSet.PlayIcon;
  readonly PauseIcon = iconSet.PauseIcon;
  readonly ActionsIcon = actionsIconSet.ActionsMenu;

  playNext(track: Track): void {
    console.log(`Play next: ${track.name}`);
  }

  addToPlaylist(): void {
    this.showPlaylists.set(true);
  }

  deleteTrack(track: Track) {
    console.log(`Remove song: ${track.name}`);
  }

  actionsClosed(reason: MenuCloseReason) {
    if (reason !== 'click' || this.showPlaylists()) {
      setTimeout(() => {
        this.showPlaylists.set(false);
      }, 250);
    }
  }
}
