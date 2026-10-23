import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Playlist } from '@shared/models/playlist.model';
import { PlaylistGridSmartComponent } from '../../pages/playlists-landing-page/playlist-grid/playlist-grid-smart/playlist-grid-smart.component';

@Component({
  selector: 'app-playlist-selection-modal',
  imports: [MatButton, PlaylistGridSmartComponent],
  templateUrl: './playlist-selection-modal.component.html',
  styleUrl: './playlist-selection-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistSelectionModalComponent {
  private readonly dialogRef: MatDialogRef<
    PlaylistSelectionModalComponent,
    PlaylistSelectionModalResult
  > = inject(MatDialogRef);
  private readonly data = inject<PlaylistSelectionModalData | null>(
    MAT_DIALOG_DATA,
    { optional: true }
  );

  readonly initialSelection = signal<Playlist | null>(
    this.data?.selectedPlaylist ?? null
  );
  readonly currentSelection = signal<Playlist | null>(
    this.data?.selectedPlaylist ?? null
  );

  readonly selectedPlaylistText = computed(() => {
    const selection = this.currentSelection();
    if (!selection) {
      return 'Nothing';
    }
    return selection.name;
  });

  updateSelection(playlist: Playlist | null): void {
    this.currentSelection.set(playlist);
  }

  save(): void {
    this.dialogRef.close(this.currentSelection());
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}

export type PlaylistSelectionModalData = {
  selectedPlaylist?: Playlist | null;
};

export type PlaylistSelectionModalResult = Playlist | null | undefined;
