import { Component, input, output } from '@angular/core';
import { PlaylistGridItemComponent } from './playlist-grid-item/playlist-grid-item.component';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import { iconSet } from '@general/icons/icons';
import { PlaylistWithTagData } from '../../../../../../../../general/models/playlist.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { GridPlaylistSizeConfig } from '../../../../../models/grid-item-size-config.model';

@Component({
  selector: 'app-playlist-grid',
  imports: [
    PlaylistGridItemComponent,
    SearchBarComponent,
    RangeSliderComponent,
    LoaderComponent,
  ],
  templateUrl: './playlist-grid.component.html',
  styleUrl: './playlist-grid.component.scss',
})
export class PlaylistGridComponent {
  readonly dataSet = input.required<PlaylistWithTagData[]>();
  readonly playlistImageMap = input<Record<string, string | null>>({});
  readonly sizeConfig = input.required<GridPlaylistSizeConfig>();
  readonly playingPlaylistId = input<string | null>();
  readonly loading = input<boolean>(false);
  readonly showControls = input<boolean>(true);

  readonly sizeChange = output<number>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();
  readonly playlistClick = output<string>();
  readonly search = output<string>();

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;

  getPlaylistImageUrl(playlist: PlaylistWithTagData) {
    return this.playlistImageMap()[playlist.id] || null;
  }

  isPlaying(playlistId: string): boolean {
    return this.playingPlaylistId() === playlistId;
  }

  trackPlaylist(playlist: PlaylistWithTagData): string {
    return playlist.id;
  }

  sizeInput(value: number) {
    this.sizeChange.emit(value / 100);
  }
}
