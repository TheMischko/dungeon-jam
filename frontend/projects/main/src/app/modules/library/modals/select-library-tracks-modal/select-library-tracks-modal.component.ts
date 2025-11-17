import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Track } from '@shared/models/track.model';
import { TrackService } from '../../../../services/track.service';
import { MatButton } from '@angular/material/button';
import { SelectLibraryTracksSelection } from './select-library-tracks-modal.types';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SongsTableComponent } from '../../pages/library-landing-page/songs-table/songs-table.component';
import { TrackLibraryStore } from '../../../../stores/track-library.store';
import { QueryOptions } from '@shared/models/request.model';

@Component({
  selector: 'app-select-library-tracks-modal',
  imports: [FormsModule, MatButton, SongsTableComponent],
  templateUrl: './select-library-tracks-modal.component.html',
  styleUrl: './select-library-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLibraryTracksModalComponent implements OnInit {
  readonly trackStore = inject(TrackLibraryStore);
  readonly trackService = inject(TrackService);
  readonly dialogRef =
    inject<MatDialogRef<SelectLibraryTracksSelection>>(MatDialogRef);
  readonly data = inject<SelectLibraryTracksModalData>(MAT_DIALOG_DATA);

  readonly tracks = computed(() => {
    return this.trackStore.entities().filter((track) => {
      return !this.data?.excludedTrackIds?.includes(track.id);
    });
  });
  readonly tracksLoading = this.trackStore.loading;
  readonly selection = signal<Track[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked',
  );
  readonly tracksQuery = signal<QueryOptions>({});

  ngOnInit() {
    this.trackStore.load(this.tracksQuery);
  }

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
    console.log(this.data, this.selection());
    this.dialogRef.close(undefined);
  }

  saveSelection() {
    this.dialogRef.close({
      selectedTracks: this.selection(),
    });
  }
}

export interface SelectLibraryTracksModalConfig {
  data: SelectLibraryTracksModalData;
}
interface SelectLibraryTracksModalData {
  excludedTrackIds: string[];
}
