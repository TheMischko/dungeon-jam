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
import { iconSet } from '../../../../../../../../general/src/lib/icons/icons';
import { MatIconButton } from '@angular/material/button';
import { TrackDurationPipe } from '../../../../../../../../general/src/lib/pipes/track-duration.pipe';

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
  ],
  templateUrl: './songs-table.component.html',
  styleUrl: './songs-table.component.scss',
})
export class SongsTableComponent {
  readonly tracks = input<Track[]>([]);
  readonly playingTrackId = input<string | null>();
  readonly activeRow = signal<Track | null>(null);

  readonly playTrack = output<Track>();
  readonly pauseTrack = output();

  readonly displayedColumns = ['play', 'title', 'author', 'duration'];

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
}
