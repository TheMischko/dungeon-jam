import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { SceneInsertQuery } from '@shared/models/scene.model';
import { SceneFormComponent } from '../../../../forms/scene-form/scene-form.component';
import {
  createSceneForm,
  SceneForm,
} from '../../../../forms/scene-form/scene-form.model';

@Component({
  selector: 'app-create-scene-modal',
  imports: [MatButton, SceneFormComponent],
  templateUrl: './create-scene-modal.component.html',
  styleUrl: './create-scene-modal.component.scss',
})
export class CreateSceneModalComponent {
  readonly dialog = inject(MatDialogRef<void, SceneInsertQuery>);
  readonly dialogData = inject<CreateSceneModalData>(MAT_DIALOG_DATA);

  readonly form: SceneForm = createSceneForm();

  cancel(): void {
    this.dialog.close(null);
  }

  save(): void {
    if (this.form().valid()) {
      const formValue = this.form().value();
      const tags = formValue.tags.map((t) => t.title) ?? [];
      this.dialog.close({
        name: formValue.name,
        description: formValue.description ?? undefined,
        imageUrl: formValue.imageUrl ?? undefined,
        tags,
        playlistId: formValue.playlist?.id ?? undefined,
      } as SceneInsertQuery);
    }
  }
}

export type CreateSceneModalData = {};
