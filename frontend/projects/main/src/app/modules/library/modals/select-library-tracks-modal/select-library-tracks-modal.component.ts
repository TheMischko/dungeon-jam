import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumnConfiguration } from '../../../../models/table.model';
import { Track } from '@shared/models/track.model';
import { TableComponent } from '../../../../components/table/table.component';
import { TrackService } from '../../../../services/track.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { MatButton } from '@angular/material/button';
import { DialogRef } from '@angular/cdk/dialog';
import { SelectLibraryTracksSelection } from './select-library-tracks-modal.types';

@Component({
  selector: 'app-select-library-tracks-modal',
  imports: [FormsModule, TableComponent, MatButton],
  templateUrl: './select-library-tracks-modal.component.html',
  styleUrl: './select-library-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLibraryTracksModalComponent {
  readonly trackService = inject(TrackService);
  readonly dialogRef = inject(DialogRef<SelectLibraryTracksSelection>);

  readonly tracks = toSignal(this.trackService.getAllTracks(), {
    initialValue: [],
  });
  private durationPipe = new TrackDurationPipe();
  readonly tableConfig = computed<TableColumnConfiguration<Track>>(() => {
    return {
      name: {
        title: 'Track Name',
      },
      author: {
        title: 'Author',
      },
      duration: {
        title: 'Length',
        customValueFn: (track: Track) => {
          return this.durationPipe.transform(track.duration);
        },
      },
    };
  });
  readonly selection = signal<Track[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked',
  );
  readonly trackTrackByFn = (index: number, track: Track) => track.id;
  readonly trackUniquenessFn = (a: Track, b: Track) => a.id === b.id;

  selectionChanged = (selectedTracks: Track[]) => {
    if (selectedTracks.length === this.tracks().length) {
      this.selectAllState.set('checked');
    } else if (this.selectAllState() === 'checked') {
      this.selectAllState.set('indeterminate');
    }
    if (selectedTracks.length === 0) {
      this.selectAllState.set('unchecked');
    }
    this.selection.set(selectedTracks);
  };

  cancelClick() {
    this.dialogRef.close(undefined);
  }

  saveSelection() {
    console.log(this.selection());
    this.dialogRef.close({
      selectedTracks: this.selection(),
    });
  }
}
