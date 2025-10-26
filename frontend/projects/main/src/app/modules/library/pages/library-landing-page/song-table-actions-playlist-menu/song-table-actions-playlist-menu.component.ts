import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { PlaylistStore } from '@general/stores/playlist.store';
import { SortDirection } from '@shared/models/common.model';
import { MatMenuItem } from '@angular/material/menu';
import { Playlist } from '@shared/models/playlist.model';
import { Track } from '@shared/models/track.model';

@Component({
  selector: 'app-song-table-actions-playlist-menu',
  imports: [MatMenuItem],
  templateUrl: './song-table-actions-playlist-menu.component.html',
  styleUrl: './song-table-actions-playlist-menu.component.scss',
})
export class SongTableActionsPlaylistMenuComponent implements OnInit {
  readonly playlistsStore = inject(PlaylistStore);

  readonly track = input<Track>();

  readonly selected = output<Playlist>();

  readonly playlists = computed<Playlist[]>(() => {
    return [...this.playlistsStore.entities()];
  });

  ngOnInit() {
    this.playlistsStore.load({
      sortBy: 'lastUpdated',
      sortDirection: SortDirection.DESC,
    });
  }

  playlistClicked(playlist: Playlist) {
    // TO-DO: Implement the update playlist flow to Electron
    console.log(`Track ${this.track()?.name} added to ${playlist.name}.`);
  }
}
