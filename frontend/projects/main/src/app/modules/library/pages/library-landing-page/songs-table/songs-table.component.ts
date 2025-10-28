import { Component, input, output, signal } from '@angular/core';
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
import { SongTableActionsMenuComponent } from '../song-table-actions-menu/song-table-actions-menu.component';
import { SongTableActionsPlaylistMenuComponent } from '../song-table-actions-playlist-menu/song-table-actions-playlist-menu.component';

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
    SongTableActionsMenuComponent,
    SongTableActionsPlaylistMenuComponent,
  ],
  templateUrl: './songs-table.component.html',
  styleUrl: './songs-table.component.scss',
})
export class SongsTableComponent {
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
