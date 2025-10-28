import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistTracksQuery, Track } from '@shared/models/track.model';
import { PlaylistTracksStore } from '../../../../../stores/playlist-tracks.store';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { Playlist } from '@shared/models/playlist.model';
import { PlaylistsDetailPageComponent } from '../playlists-detail-page.component';
import { PlaybackService } from '../../../../../services/playback.service';
import { PlaybackState } from '../../../../../models/playback.model';

@Component({
  selector: 'app-playlists-detail-page-smart',
  imports: [PlaylistsDetailPageComponent],
  templateUrl: './playlists-detail-page-smart.component.html',
})
export class PlaylistsDetailPageSmartComponent implements OnInit {
  readonly playlistTracksStore = inject(PlaylistTracksStore);
  readonly playlistService = inject(PlaylistApiService);
  readonly playbackService = inject(PlaybackService);

  readonly playlistId = input<string>('', { alias: 'id' });

  readonly tracks = this.playlistTracksStore.entities;
  readonly playlistId$ = toObservable(this.playlistId);
  readonly playlist = toSignal<Playlist | null>(
    this.playlistId$.pipe(
      switchMap((playlistId) => {
        return this.playlistService.getById(playlistId);
      }),
    ),
    { initialValue: null },
  );
  readonly playbackState = toSignal<PlaybackState | null>(
    this.playbackService.playback$.pipe(
      map((state) => {
        if (state.playlistId !== this.playlistId()) {
          return null;
        }
        return state;
      }),
    ),
    { initialValue: null },
  );
  readonly isPlaylistPlaying = computed<boolean>(() => {
    return this.playbackState()?.isPlaying ?? false;
  });
  readonly currentFilter = signal<string>('');
  readonly currentSortBy = signal<string>('name');
  readonly currentSortDirection = signal<SortDirection>(SortDirection.ASC);

  readonly loadQuery = computed<PlaylistTracksQuery>(() => ({
    filter: this.currentFilter(),
    sortDirection: this.currentSortDirection(),
    sortBy: this.currentSortBy(),
    playlistId: this.playlistId(),
  }));

  ngOnInit() {
    this.playlistTracksStore.load(this.loadQuery);
  }

  async playPlaylist() {
    const tracks = this.tracks();
    await this.playbackService.play(
      tracks[0],
      tracks.slice(1),
      this.playlistId(),
    );
  }

  async playTrack(track: Track) {
    const tracks = this.tracks();
    const trackIndex = tracks.indexOf(track);
    if (trackIndex < 0) {
      return;
    }
    await this.playbackService.play(
      tracks[trackIndex],
      [...tracks.slice(trackIndex), ...tracks.slice(0, trackIndex)],
      this.playlistId(),
    );
  }

  async pausePlaying() {
    this.playbackService.pause();
  }
}
