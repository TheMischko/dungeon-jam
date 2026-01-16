import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { PlaylistFormComponent } from '../../../../forms/playlist-form/playlist-form.component';
import { createPlaylistForm } from '../../../../forms/playlist-form/playlist-form.model';

@Component({
  selector: 'app-create-playlist-modal',
  imports: [MatButton, PlaylistFormComponent],
  templateUrl: './create-playlist-modal.component.html',
  styleUrl: './create-playlist-modal.component.scss',
})
export class CreatePlaylistModalComponent {
  readonly dialog = inject(MatDialogRef<void, PlaylistInsertQuery>);

  readonly form = createPlaylistForm()

  cancel(): void {
    this.dialog.close(null);
  }

  save() {
    if (this.form().valid()) {
      const formValue = this.form().value();
      const tags = formValue.tags ?? [];
      this.dialog.close({
        name: formValue.name,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        tags,
        parentPlaylistId: formValue.parentPlaylist?.id ?? undefined
      });
    }
  }
}
