import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PlaylistGridComponent } from '../playlist-grid.component';
import { Playlist } from '@shared/models/playlist.model';
import { GridItemSizeConfig } from '../playlist-grid-item/playlist-grid-item.component';
import { SortDirection } from '@shared/models/common.model';
import { QueryRequest } from '@shared/models/request.model';
import { PlaylistStore } from '@general/stores/playlist.store';

@Component({
  selector: 'app-playlist-grid-smart',
  imports: [PlaylistGridComponent],
  templateUrl: './playlist-grid-smart.component.html',
  styleUrl: './playlist-grid-smart.component.scss',
})
export class PlaylistGridSmartComponent implements OnInit {
  readonly playlistStore = inject(PlaylistStore);

  readonly sizeSliderValue = signal<number>(0.75);
  readonly playingPlaylistId = signal<string | null>(null);
  readonly searchFilter = signal<string>('');
  readonly sortDirection = signal<SortDirection>(SortDirection.ASC);
  readonly sortBy = signal<Extract<keyof Playlist, string>>('dateCreated');

  readonly dataSet = this.playlistStore.entities;

  readonly sizeConfig = computed<GridItemSizeConfig>(() => {
    const sliderVal = this.sizeSliderValue();
    return getSizeConfig(sliderVal);
  });
  readonly queryOptions = computed<QueryRequest>(() => ({
    filter: this.searchFilter(),
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection(),
  }));

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
    this.playingPlaylistId.set(playlistId);
  }

  pausePlaylist() {
    this.playingPlaylistId.set(null);
  }

  showPlaylistDetails(playlistId: string) {
    console.log(`Navigate to playlist: ${playlistId}`);
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
      hideTags: false,
      hideTracks: false,
      titleBold: true,
    };
  }

  return {
    imageSize: 250,
    fontSize: 18,
    overlaySize: 50,
    hideTags: false,
    hideTracks: false,
    titleBold: true,
  };
}
