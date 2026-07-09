import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';
import { FilterBoxComponent } from '../filter-box/filter-box.component';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-playlist-filter',
  imports: [FilterBoxComponent],
  templateUrl: './playlist-filter.component.html',
  styleUrl: './playlist-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistFilterComponent implements OnInit {
  readonly playlistService = inject(PlaylistApiService);
  readonly destroyRef = inject(DestroyRef);

  readonly initialIds = input<string[]>([]);

  readonly selectionChange = output<Playlist[]>();

  readonly playlists = signal<Playlist[]>([]);
  readonly displayField: keyof Playlist = 'name';
  readonly trackById = (_: number, item: Playlist) => item.id;

  readonly initialSelection = computed(() => {
    const initialIds = this.initialIds();
    return this.playlists().filter((p) => initialIds.includes(p.id));
  });

  ngOnInit() {
    this.playlistService
      .getAllPlaylists({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((playlists: Playlist[]) => {
        this.playlists.set(playlists);
      });
  }

  emitSelection(selection: Playlist[]) {
    this.selectionChange.emit(selection);
  }
}
