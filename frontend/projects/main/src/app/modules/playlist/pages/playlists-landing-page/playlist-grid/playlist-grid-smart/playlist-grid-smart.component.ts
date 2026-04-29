import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { PlaylistGridComponent } from '../playlist-grid.component';
import { Playlist } from '@shared/models/playlist.model';
import { SortDirection } from '@shared/models/common.model';
import { QueryRequest } from '@shared/models/request.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { Router } from '@angular/router';
import { playlistRouteStrings } from '../../../../playlist-route-strings';
import { PlaybackService } from '../../../../../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs';
import { TrackService } from '../../../../../../services/track.service';
import { TagsStore } from '@general/stores/tags.store';
import { PlaylistWithTagData } from '../../../../../../../../../general/models/playlist.model';
import { GridItemSizeConfig } from '../../../../../../models/grid-item-size-config.model';

@Component({
  selector: 'app-playlist-grid-smart',
  imports: [PlaylistGridComponent],
  templateUrl: './playlist-grid-smart.component.html',
  styleUrl: './playlist-grid-smart.component.scss',
})
export class PlaylistGridSmartComponent implements OnInit {
  readonly playlistStore = inject(PlaylistStore);
  readonly tagsStore = inject(TagsStore);
  readonly playbackService = inject(PlaybackService);
  readonly trackService = inject(TrackService);
  readonly router = inject(Router);

  readonly showControls = input<boolean>(true);

  readonly sizeSliderValue = signal<number>(0.75);
  readonly searchFilter = signal<string>('');
  readonly sortDirection = signal<SortDirection>(SortDirection.ASC);
  readonly sortBy = signal<Extract<keyof Playlist, string>>('order');

  readonly dataSet = computed<PlaylistWithTagData[]>(() => {
    const loading = this.loading();
    if (loading) {
      return [];
    }
    const tags = untracked(() => this.tagsStore.entityMap());
    return this.playlistStore.entities().map((playlist) => {
      const playlistTags = playlist.tags.map((t) => tags[t]).filter((t) => !!t);
      return {
        ...playlist,
        tags: playlistTags,
      };
    });
  });

  readonly loading = computed<boolean>(() => {
    return this.playlistStore.loading() || this.tagsStore.loading();
  });
  readonly sizeConfig = computed<GridItemSizeConfig>(() => {
    const sliderVal = this.sizeSliderValue();
    return getSizeConfig(sliderVal);
  });
  readonly queryOptions = computed<QueryRequest>(() => ({
    search: this.searchFilter(),
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection(),
  }));
  readonly playingPlaylistId = toSignal(
    this.playbackService.playback$.pipe(
      map((state) => (state.isPlaying ? state.playlistId : undefined))
    )
  );

  ngOnInit() {
    this.playlistStore.load(this.queryOptions);
  }

  handleSizeChange(newSize: number) {
    if (newSize > 100 || newSize < 0) {
      return;
    }
    this.sizeSliderValue.set(newSize);
  }

  playPlaylist(playlistId: string) {
    this.trackService
      .getTracksByPlaylist({
        playlistId,
        sortBy: 'name',
        sortDirection: SortDirection.ASC,
      })
      .pipe(take(1))
      .subscribe(async (tracks) => {
        if (!tracks?.length) {
          return;
        }
        await this.playbackService.play(tracks[0], tracks.slice(1), playlistId);
      });
  }

  pausePlaylist() {
    this.playbackService.pause();
  }

  async showPlaylistDetails(playlistId: string) {
    await this.router.navigate([
      playlistRouteStrings.playlists,
      playlistRouteStrings.detail,
      playlistId,
    ]);
  }
}

function getSizeConfig(sliderVal: number) {
  if (sliderVal <= 0.25) {
    return {
      imageSize: 100,
      fontSize: 12,
      overlaySize: 30,
      hideTracks: true,
      hideTags: true,
      titleBold: false,
    };
  }

  if (sliderVal <= 0.5 && sliderVal > 0.25) {
    return {
      imageSize: 150,
      fontSize: 14,
      overlaySize: 35,
      trackCountSize: 14,
      hideTracks: true,
      hideTags: true,
      titleBold: true,
    };
  }

  if (sliderVal <= 0.75 && sliderVal > 0.5) {
    return {
      imageSize: 175,
      fontSize: 16,
      overlaySize: 40,
      trackCountSize: 16,
      hideTags: false,
      hideTracks: false,
      titleBold: true,
    };
  }

  return {
    imageSize: 250,
    fontSize: 18,
    overlaySize: 50,
    trackCountSize: 18,
    hideTags: false,
    hideTracks: false,
    titleBold: true,
  };
}
