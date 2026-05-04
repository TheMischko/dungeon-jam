import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SoundEffect } from '@shared/models/sound-effect.model';
import {
  createSoundEffectForm,
  SoundEffectForm,
} from '../../../../forms/sound-effect-form/sound-effect-form.model';
import { TagsStore } from '@general/stores/tags.store';
import { disabled } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { SoundEffectFormComponent } from '../../../../forms/sound-effect-form/sound-effect-form.component';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatestWith, map } from 'rxjs';
import { actionsIconSet } from '@general/icons/icons';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sound-effect-edit-modal',
  imports: [
    MatButton,
    SoundEffectFormComponent,
    LoaderComponent,
    LucideAngularModule,
  ],
  templateUrl: './sound-effect-edit-modal.component.html',
  styleUrl: './sound-effect-edit-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectEditModalComponent {
  readonly soundEffect = inject<SoundEffect>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);
  readonly tagStore = inject(TagsStore);
  readonly loading = this.tagStore.loading;

  readonly loading$ = toObservable(this.loading);
  readonly initialized$ = toObservable(this.tagStore.initialized);
  readonly tagsReady = this.loading$.pipe(
    combineLatestWith(this.initialized$),
    map(([loading, initialized]) => !loading && initialized)
  );

  readonly saveIcon = actionsIconSet.SaveIcon;
  readonly deleteIcon = actionsIconSet.DeleteIcon;

  readonly soundEffectForm = signal<SoundEffectForm>(
    createSoundEffectForm(
      {
        title: '',
        path: '',
        description: '',
        tags: [],
      },
      (form) => {
        disabled(form.path);
      }
    )
  );

  constructor() {
    this.tagsReady.subscribe((ready) => {
      if (!ready) {
        return;
      }
      const tags =
        this.soundEffect.tags
          ?.map((tagId) => this.tagStore.getById(tagId))
          .filter((v) => !!v) || [];
      this.soundEffectForm().title().value.set(this.soundEffect.name);
      this.soundEffectForm()
        .description()
        .value.set(this.soundEffect.description ?? '');
      this.soundEffectForm().path().value.set(this.soundEffect.url);
      this.soundEffectForm().tags().value.set(tags);
    });
  }

  cancel(): void {
    this.dialog.close({ type: 'cancel' });
  }

  deleteSoundEffect(): void {
    this.dialog.close({ type: 'delete', soundEffectId: this.soundEffect.id });
  }

  updateSoundEffect(): void {
    const updateValues = this.soundEffectForm()?.().value();
    this.dialog.close({
      type: 'update',
      soundEffectId: this.soundEffect.id,
      data: {
        ...this.soundEffect,
        name: updateValues.title!,
        description: updateValues.description!,
        tags: updateValues.tags.map((t) => t.id),
      },
    });
  }
}

export type EditSoundEffectResult =
  | CancelResult
  | DeleteResult
  | UpdateResult;

export type CancelResult = {
  type: 'cancel';
};

export type DeleteResult = {
  type: 'delete';
  soundEffectId: string;
};

export type UpdateResult = {
  type: 'update';
  soundEffectId: string;
  data: SoundEffect;
};
