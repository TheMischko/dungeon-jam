import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';
import { PlaylistFormComponent } from '../../../../forms/playlist-form/playlist-form.component';
import {
  createPlaylistForm,
  PlaylistForm,
} from '../../../../forms/playlist-form/playlist-form.model';
import { disabled } from '@angular/forms/signals';

@Component({
  selector: 'app-create-playlist-modal',
  imports: [MatButton, PlaylistFormComponent],
  templateUrl: './create-playlist-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-playlist-modal.component.scss',
})
export class CreatePlaylistModalComponent {
  readonly dialog = inject(MatDialogRef<void, PlaylistInsertQuery>);
  readonly dialogData = inject<CreatePlaylistModalData>(MAT_DIALOG_DATA);

  readonly form: PlaylistForm = createPlaylistForm(
    { parentPlaylist: this.dialogData?.parentPlaylist ?? null },
    this.dialogData?.parentPlaylist
      ? (form) => {
          disabled(form.parentPlaylist);
        }
      : undefined
  );

  cancel(): void {
    this.dialog.close(null);
  }

  save(): void {
    if (this.form().valid()) {
      const formValue = this.form().value();
      const tags = formValue.tags ?? [];
      this.dialog.close({
        name: formValue.name,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        tags,
        parentPlaylistId: formValue.parentPlaylist?.id ?? undefined,
      } as PlaylistInsertQuery);
    }
  }
}

export type CreatePlaylistModalData = {
  parentPlaylist?: Playlist | null;
};
