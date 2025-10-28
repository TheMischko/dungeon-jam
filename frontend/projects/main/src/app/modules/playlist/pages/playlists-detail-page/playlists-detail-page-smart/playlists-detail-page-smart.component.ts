import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistTracksQuery } from '@shared/models/track.model';
import { PlaylistTracksStore } from '../../../../../stores/playlist-tracks.store';
import { SongsTableComponent } from '../../../../library/pages/library-landing-page/songs-table/songs-table.component';

@Component({
  selector: 'app-playlists-detail-page-smart',
  imports: [SongsTableComponent],
  templateUrl: './playlists-detail-page-smart.component.html',
})
export class PlaylistsDetailPageSmartComponent implements OnInit {
  readonly playlistTracksStore = inject(PlaylistTracksStore);

  readonly playlistId = input<string>('', { alias: 'id' });

  readonly tracks = this.playlistTracksStore.entities;
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
}
