import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import { AudioPlayerService } from '../../../../services/audio-player.service';
import { debounceTime, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayingTrackState } from '../../../../models/playback.model';

@Component({
  selector: 'app-select-library-tracks-modal',
  imports: [FormsModule, MatButton, SongsTableComponent],
  providers: [AudioPlayerService],
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
  readonly audioPlayerService = inject(AudioPlayerService);
  readonly destroyRef = inject(DestroyRef);

  readonly tracks = computed(() => {
    return this.trackStore.entities().filter((track) => {
      return !this.data?.excludedTrackIds?.includes(track.id);
    });
  });
  readonly tracksLoading = this.trackStore.loading;
  readonly selection = signal<Track[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly tracksQuery = signal<QueryOptions>({});
  readonly trackIdPlaying = signal<string | null>(null);
  protected trackPlayingSubscription: Subscription | undefined;

  ngOnInit() {
    this.trackStore.load(this.tracksQuery);
    this.audioPlayerService.setVolume(0.8);
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
    this.dialogRef.close(undefined);
  }

  saveSelection() {
    this.dialogRef.close({
      selectedTracks: this.selection(),
    });
  }

  protected async playTrack(track: Track) {
    this.trackPlayingSubscription?.unsubscribe();
    this.trackIdPlaying.set(null);
    await this.audioPlayerService.play(track);
    const previewPos = track.duration <= 40 ? 10 : track.duration * 0.72;
    this.audioPlayerService.seek(previewPos);
    this.trackPlayingSubscription = this.audioPlayerService.state$
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(100))
      .subscribe((state) => {
        if (state === PlayingTrackState.PLAYING) {
          this.trackIdPlaying.set(track.id);
        } else {
          this.trackIdPlaying.set(null);
        }
      });
  }

  protected pauseTrack() {
    this.audioPlayerService.stop();
    this.trackIdPlaying.set(null);
    this.trackPlayingSubscription?.unsubscribe();
  }
}

export interface SelectLibraryTracksModalConfig {
  data: SelectLibraryTracksModalData;
}
interface SelectLibraryTracksModalData {
  excludedTrackIds: string[];
}
