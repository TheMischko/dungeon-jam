import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { PlaylistStore } from '@general/stores/playlist.store';
import { Playlist } from '@shared/models/playlist.model';
import { FilterBoxComponent } from '../filter-box/filter-box.component';
import { SortDirection } from '@shared/models/common.model';

@Component({
  selector: 'app-playlist-filter',
  imports: [FilterBoxComponent],
  templateUrl: './playlist-filter.component.html',
  styleUrl: './playlist-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistFilterComponent implements OnInit {
  readonly playlistStore = inject(PlaylistStore);
  readonly playlists = this.playlistStore.entities;
  readonly displayField: keyof Playlist = 'name';
  readonly trackById = (_: number, item: Playlist) => item.id;
  readonly selectionChange = output<Playlist[]>();

  ngOnInit() {
    this.playlistStore.load({
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    });
  }

  emitSelection(selection: Playlist[]) {
    this.selectionChange.emit(selection);
  }
}
