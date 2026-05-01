import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Playlist } from '@shared/models/playlist.model';
import { ImageApiService } from '@general/services/image-api.service';

@Component({
  selector: 'app-child-playlist-box',
  imports: [],
  templateUrl: './child-playlist-box.component.html',
  styleUrl: './child-playlist-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildPlaylistBoxComponent {
  readonly imageApiService = inject(ImageApiService);

  readonly playlist = input.required<Playlist>();

  readonly clicked = output<Playlist>();

  readonly imageSrc = signal<string | null>(null);

  constructor() {
    effect(() => {
      const playlist = this.playlist();
      if (!playlist?.imageUrl) {
        this.imageSrc.set(null);
        return;
      }
      const sub = this.imageApiService
        .fetchImage(playlist.imageUrl)
        .subscribe((imageUrl) => {
          this.imageSrc.set(imageUrl);
        });

      return () => {
        sub?.unsubscribe();
      };
    });
  }
}
