import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumnConfiguration } from '../../../../models/table.model';
import { Track } from '@shared/models/track.model';
import { TableComponent } from '../../../../components/table/table.component';
import { TrackService } from '../../../../services/track.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';

@Component({
  selector: 'app-select-library-tracks-modal',
  imports: [FormsModule, TableComponent],
  templateUrl: './select-library-tracks-modal.component.html',
  styleUrl: './select-library-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLibraryTracksModalComponent {
  readonly trackService = inject(TrackService);

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
}
