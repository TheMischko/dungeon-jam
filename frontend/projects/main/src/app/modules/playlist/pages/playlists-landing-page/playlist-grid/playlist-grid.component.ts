import { Component, input, output } from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';
import {
  GridItemSizeConfig,
  PlaylistGridItemComponent,
} from './playlist-grid-item/playlist-grid-item.component';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import { iconSet } from '@general/icons/icons';

@Component({
  selector: 'app-playlist-grid',
  imports: [
    PlaylistGridItemComponent,
    SearchBarComponent,
    RangeSliderComponent,
  ],
  templateUrl: './playlist-grid.component.html',
  styleUrl: './playlist-grid.component.scss',
})
export class PlaylistGridComponent {
  readonly dataSet = input<Playlist[]>();
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly playingPlaylistId = input<string | null>();

  readonly sizeChange = output<number>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();
  readonly playlistClick = output<string>();
  readonly search = output<string>();

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;

  isPlaying(playlistId: string): boolean {
    return this.playingPlaylistId() === playlistId;
  }

  trackPlaylist(playlist: Playlist): string {
    return playlist.id;
  }

  sizeInput(value: number) {
    this.sizeChange.emit(value / 100);
  }
}
