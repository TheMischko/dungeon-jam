import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { TrackLibraryStore } from '../../../../../stores/track-library.store';
import { PlaybackService } from '../../../../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HomeLandingPageComponent } from '../home-landing-page.component';
import { Track } from '@shared/models/track.model';

@Component({
  selector: 'app-home-landing-page-smart',
  imports: [HomeLandingPageComponent],
  templateUrl: './home-landing-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLandingPageSmartComponent implements OnInit {
  readonly tracksStore = inject(TrackLibraryStore);
  readonly playbackService = inject(PlaybackService);

  readonly trackEntities = this.tracksStore.entities;
  readonly tracksLoading = this.tracksStore.loading;
  readonly tracks = computed<Track[]>(() => {
    return [...this.trackEntities()]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  });
  readonly currentlyPlayingTrackId = toSignal(
    this.playbackService.playback$.pipe(
      map((playback) => playback.currentTrack?.id ?? null),
    ),
    { initialValue: null },
  );

  ngOnInit(): void {
    this.tracksStore.load({
      sortBy: 'id',
      sortDirection: SortDirection.DESC,
    });
  }

  async playTrack(track: Track): Promise<void> {
    const tracks = this.tracks();
    const trackIndex = tracks.findIndex((t) => t.id === track.id);
    const queue = [
      ...tracks.slice(trackIndex + 1),
      ...tracks.slice(0, trackIndex),
    ];
    await this.playbackService.play(track, queue);
  }

  pausePlaying(): void {
    this.playbackService.pause();
  }
}
