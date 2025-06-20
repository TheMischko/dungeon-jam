import { Component, input, signal } from '@angular/core';
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
  readonly activeRow = signal<Track | null>(null);

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

  readonly PlayIcon = iconSet.PlayIcon;
  readonly PauseIcon = iconSet.PauseIcon;
}
