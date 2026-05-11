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
import { TrackService } from '../../../../services/track.service';
import { Track } from '@shared/models/track.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Playlist } from '@shared/models/playlist.model';
import { QueryOptions } from '@shared/models/request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subscription, take } from 'rxjs';
import { AudioPlayerService } from '../../../../services/audio-player.service';
import { PlayingTrackState } from '../../../../models/playback.model';

@Component({
  selector: 'app-discover-tracks-modal',
  imports: [MatButton, SongsTableComponent],
  providers: [AudioPlayerService],
  templateUrl: './discover-tracks-modal.component.html',
  styleUrl: './discover-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverTracksModalComponent implements OnDestroy {
  readonly tracksApiService = inject(TrackService);
  readonly audioPlayerService = inject(AudioPlayerService);
  readonly destroyRef = inject(DestroyRef);

  readonly dialogRef = inject(MatDialogRef);
  readonly data: DiscoverTracksModalData = inject(MAT_DIALOG_DATA);

  get playlist(): Playlist {
    return this.data.playlist;
  }

  readonly tracks = signal<Track[]>([]);
  readonly tracksLoading = signal<boolean>(false);
  readonly tracksQuery = signal<QueryOptions>({});
  readonly selection = signal<Track[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly trackIdPlaying = signal<string | null>(null);
  protected trackPlayingSubscription: Subscription | undefined;

  protected readonly PAGE_SIZES = [5, 10, 25, 50];
  protected readonly batchSize = signal<number>(this.PAGE_SIZES[0]);

  constructor() {
    effect(() => {
      const query = this.tracksQuery();
      const batchSize = this.batchSize();
      this.tracksLoading.set(true);
      this.tracksApiService
        .discoverTracks({
          ...query,
          random: true,
          playlistId: this.playlist.id,
          batchSize,
        })
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
    this.dialogRef.close({
      selectedTracks: this.selection(),
      again,
    });
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
}

export type DiscoverTracksModalData = {
  playlist: Playlist;
};
