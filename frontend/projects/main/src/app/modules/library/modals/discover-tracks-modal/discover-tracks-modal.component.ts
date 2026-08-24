import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { SongsTableComponent } from '../../pages/library-landing-page/songs-table/songs-table.component';
import { Track } from '@shared/models/track.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Playlist } from '@shared/models/playlist.model';
import { QueryOptions } from '@shared/models/request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subscription, take } from 'rxjs';
import { AudioPlayerService } from '../../../../services/audio-player.service';
import { PlayingTrackState } from '../../../../models/playback.model';
import { DiscoverTracksStateService } from '../../../../services/discover-tracks-state.service';
import { DEFAULT_PAGINATION_PAGES } from '../../../../models/pagination.model';

@Component({
  selector: 'app-discover-tracks-modal',
  imports: [MatButton, SongsTableComponent],
  providers: [AudioPlayerService],
  templateUrl: './discover-tracks-modal.component.html',
  styleUrl: './discover-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverTracksModalComponent implements OnDestroy {
  readonly audioPlayerService = inject(AudioPlayerService);
  readonly destroyRef = inject(DestroyRef);
  readonly discoverStateService = inject(DiscoverTracksStateService);

  readonly dialogRef = inject(MatDialogRef);
  readonly data: DiscoverTracksModalData = inject(MAT_DIALOG_DATA);

  get playlist(): Playlist {
    return this.data.playlist;
  }

  readonly tracks = signal<Track[]>([]);
  readonly tracksLoading = signal<boolean>(false);
  readonly tracksQuery = signal<QueryOptions>(this.discoverStateService.query);
  readonly batchSize = signal<number>(this.discoverStateService.batchSize);
  readonly selection = signal<Track[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly trackIdPlaying = signal<string | null>(null);
  protected trackPlayingSubscription: Subscription | undefined;

  protected readonly PAGE_SIZES = DEFAULT_PAGINATION_PAGES;

  constructor() {
    effect(() => {
      const query = this.tracksQuery();
      const batchSize = this.batchSize();
      this.tracksLoading.set(true);
      this.discoverStateService
        .discoverTracks(this.playlist.id, batchSize, query)
        .pipe(take(1))
        .subscribe({
          next: (tracks) => {
            this.tracks.set(tracks);
          },
          complete: () => {
            this.tracksLoading.set(false);
          },
        });
    });

    this.audioPlayerService.setVolume(0.8);
  }

  ngOnDestroy() {
    this.pauseTrack();
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

  saveSelection(again: boolean) {
    const selectedIds = new Set(this.selection().map((t) => t.id));
    const unselectedIds = this.tracks()
      .filter((track) => !selectedIds.has(track.id))
      .map((track) => track.id);

    this.discoverStateService.excludeIds(unselectedIds);

    this.dialogRef.close({
      selectedTracks: this.selection(),
      again,
      query: this.tracksQuery(),
    } as DiscoverTracksModalResult);
  }

  protected async playTrack(track: Track) {
    this.trackPlayingSubscription?.unsubscribe();
    this.trackIdPlaying.set(null);
    await this.audioPlayerService.play({
      ...track,
      duration: track.duration,
    });
    const previewPos = track.duration <= 45 ? 10 : track.duration * 0.72;
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

  protected updateQuery(query: QueryOptions) {
    this.discoverStateService.query = query;
    this.tracksQuery.set(query);
  }

  protected updatePageSize(pageSize: number) {
    this.discoverStateService.batchSize = pageSize;
    this.batchSize.set(pageSize);
  }
}

export type DiscoverTracksModalData = {
  playlist: Playlist;
  query?: QueryOptions;
};

export type DiscoverTracksModalResult = {
  selectedTracks: Track[];
  again: boolean;
  query?: QueryOptions;
};
