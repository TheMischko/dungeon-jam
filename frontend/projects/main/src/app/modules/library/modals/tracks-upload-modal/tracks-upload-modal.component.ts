import { Component, computed, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AudioTrack } from '@shared/models/track.model';
import { MatButton } from '@angular/material/button';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

export type TracksUploadModalData = {
  title: string;
  tracks?: AudioTrack[];
};

@Component({
  selector: 'app-tracks-upload-modal',
  imports: [
    MatDialogModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
  ],
  templateUrl: './tracks-upload-modal.component.html',
  styleUrl: './tracks-upload-modal.component.scss',
  standalone: true,
})
export class TracksUploadModalComponent {
  readonly data = inject<TracksUploadModalData>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);

  readonly currentStep = signal<number>(0);
  readonly isLastStep = computed(
    () => this.currentStep() === this.tracks.length - 1,
  );

  readonly forms = new FormArray<
    FormGroup<{
      path: FormControl<string | null>;
      title: FormControl<string | null>;
      author: FormControl<string | null>;
    }>
  >([]);

  constructor() {
    this.tracks.forEach((track, index) => {
      this.forms.insert(
        index,
        new FormGroup({
          path: new FormControl({ value: track.fullPath, disabled: true }),
          title: new FormControl(track.title, [Validators.required]),
          author: new FormControl(track.author || null),
        }),
      );
    });
  }

  get title(): string {
    return this.data.title;
  }

  get tracks(): AudioTrack[] {
    return this.data.tracks || [];
  }

  cancel() {
    this.dialog.close(null);
  }

  nextStep() {
    if (this.currentStep() === this.tracks.length - 1 && this.forms.valid) {
      const result: AudioTrack[] = this.forms.controls.map((group, index) => {
        const value = group.value;
        return {
          title: value.title!,
          fullPath: this.tracks[index].fullPath,
          author: value.author || undefined,
          length: this.tracks[index].length,
        };
      });
      this.dialog.close(result);
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
}
