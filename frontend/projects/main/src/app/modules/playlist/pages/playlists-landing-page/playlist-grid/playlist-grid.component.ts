import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PlaylistGridItemComponent } from './playlist-grid-item/playlist-grid-item.component';
import { iconSet } from '@general/icons/icons';
import { PlaylistWithTagData } from '@general/models/playlist.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { GridPlaylistSizeConfig } from '../../../../../models/grid-item-size-config.model';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { GridControlsComponent } from '../../../../../components/grid/grid-controls/grid-controls.component';
import { ActionsMenuConfig } from '@general/components/display/actions-menu/actions-menu.component';
import {
  PlaylistParentFilterChange,
  PlaylistParentFilterComponent,
} from '../../../components/playlist-parent-filter/playlist-parent-filter.component';

@Component({
  selector: 'app-playlist-grid',
  imports: [
    PlaylistGridItemComponent,
    LoaderComponent,
    CdkDrag,
    CdkDropList,
    GridControlsComponent,
    PlaylistParentFilterComponent,
  ],
  templateUrl: './playlist-grid.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './playlist-grid.component.scss',
})
export class PlaylistGridComponent {
  readonly dataSet = input.required<PlaylistWithTagData[]>();
  readonly playlistImageMap = input<Record<string, string | null>>({});
  readonly sizeConfig = input.required<GridPlaylistSizeConfig>();
  readonly playingPlaylistId = input<string | null>();
  readonly loading = input<boolean>(false);
  readonly showControls = input<boolean>(true);
  readonly reorderingEnabled = input<boolean>(true);

  readonly sizeChange = output<number>();
  readonly playPlaylist = output<string>();
  readonly pausePlaylist = output<string>();
  readonly playlistClick = output<string>();
  readonly search = output<string>();
  readonly reorderDrop = output<CdkDragDrop<PlaylistWithTagData[]>>();
  readonly editPlaylist = output<PlaylistWithTagData>();
  readonly deletePlaylist = output<PlaylistWithTagData>();
  readonly parentChange = output<PlaylistParentFilterChange>();

  readonly playlistActions: ActionsMenuConfig<PlaylistWithTagData, string>[] = [
    {
      text: 'Edit playlist',
      onSelected: (playlist: PlaylistWithTagData) => {
        this.editPlaylist.emit(playlist);
      },
    },
    {
      text: 'Delete playlist',
      onSelected: (playlist: PlaylistWithTagData) => {
        this.deletePlaylist.emit(playlist);
      },
    },
  ];

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

  protected playlistDropped(event: CdkDragDrop<PlaylistWithTagData[]>) {
    this.reorderDrop.emit(event);
  }
}
