import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '@general/components/controls/input/input.component';
import { MatButton } from '@angular/material/button';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';

@Component({
  selector: 'app-create-playlist-modal',
  imports: [ReactiveFormsModule, InputComponent, MatButton, TagsInputComponent],
  templateUrl: './create-playlist-modal.component.html',
  styleUrl: './create-playlist-modal.component.scss',
})
export class CreatePlaylistModalComponent {
  readonly dialog = inject(MatDialogRef<void, PlaylistInsertQuery>);

  readonly form = new FormGroup({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    description: new FormControl<string | null>(null),
    imageUrl: new FormControl<string | null>(null),
    tags: new FormControl<string[]>([]),
  });

  cancel(): void {
    this.dialog.close(null);
  }

  save() {
    if (this.form.valid) {
      const tags = this.form.controls.tags?.getRawValue() ?? [];
      this.dialog.close({
        name: this.form.controls.name.getRawValue(),
        description: this.form.controls.description.getRawValue(),
        imageUrl: this.form.controls.imageUrl.getRawValue(),
        tags,
      });
    }
  }
}
