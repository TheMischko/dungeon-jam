import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AudioTrack } from '@shared/models/track.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  createSoundEffectForm,
  SoundEffectFormData,
} from '../../../../forms/sound-effect-form/sound-effect-form.model';
import { TagData } from '@shared/models/tag.model';
import { disabled } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { SoundEffectFormComponent } from '../../../../forms/sound-effect-form/sound-effect-form.component';

@Component({
  selector: 'app-sound-effect-upload-modal',
  imports: [MatButton, SoundEffectFormComponent],
  templateUrl: './sound-effect-upload-modal.component.html',
  styleUrl: './sound-effect-upload-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectUploadModalComponent {
  readonly data: SoundEffectUploadModalData = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(
    MatDialogRef<SoundEffectUploadModalComponent, SoundEffectFormData>
  );

  readonly currentStep = signal<number>(0);
  readonly isLastStep = computed(
    () => this.currentStep() === this.forms.length - 1
  );
  readonly currentForm = computed(() => {
    return this.forms[this.currentStep()];
  });

  readonly forms = this.data.audioTracks.map((track) => {
    const tags = track?.tags
      ? track.tags
          .map((t) => this.data.tagsMap.get(t))
          .filter((t) => t !== undefined)
      : [];
    return createSoundEffectForm(
      {
        title: track.title,
        path: track.fullPath,
        tags,
      },
      (form) => {
        disabled(form.path);
      }
    );
  });

  cancel(): void {
    this.dialogRef.close([]);
  }

  nextStep(): void {
    if (this.isLastStep()) {
      if (!this.formsAreValid()) {
        return;
      }

      this.dialogRef.close(
        this.forms.map((form) => form().value()) as SoundEffectFormData[]
      );

      return;
    }
    this.currentStep.set(this.currentStep() + 1);
  }

  previousStep() {
    if (this.currentStep() === 0) {
      return;
    }
    this.currentStep.set(this.currentStep() - 1);
  }

  private formsAreValid(): boolean {
    return this.forms.every((form) => form().valid());
  }
}

export type SoundEffectUploadModalData = {
  audioTracks: AudioTrack[];
  tagsMap: Map<string, TagData>;
};
