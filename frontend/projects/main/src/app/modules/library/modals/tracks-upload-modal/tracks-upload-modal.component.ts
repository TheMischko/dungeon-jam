import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { InputComponent } from '@general/components/controls/input/input.component';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';
import { TagData } from '@shared/models/tag.model';

export type TracksUploadModalData = {
  title: string;
  tracks?: AudioTrack[];
};

@Component({
  selector: 'app-tracks-upload-modal',
  imports: [
    MatDialogModule,
    MatButton,
    ReactiveFormsModule,
    InputComponent,
    TagsInputComponent,
  ],
  templateUrl: './tracks-upload-modal.component.html',
  styleUrl: './tracks-upload-modal.component.scss',
  standalone: true,
})
export class TracksUploadModalComponent implements OnInit {
  readonly data = inject<TracksUploadModalData>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);

  readonly currentStep = signal<number>(0);
  readonly isLastStep = computed(
    () => this.currentStep() === this.tracks.length - 1,
  );
  readonly currentForm = computed(() => {
    return this.forms.controls[this.currentStep()];
  });
  readonly currentPathControl = computed(() => {
    return this.currentForm().controls.path;
  });
  readonly currentTitleControl = computed(() => {
    return this.currentForm().controls.title;
  });
  readonly currentAuthorControl = computed(() => {
    return this.currentForm().controls.author;
  });
  readonly currentTagsControl = computed(() => {
    return this.currentForm().controls.tags;
  });

  readonly forms = new FormArray<
    FormGroup<{
      path: FormControl<string | null>;
      title: FormControl<string | null>;
      author: FormControl<string | null>;
      tags: FormControl<TagData[] | null>;
    }>
  >([]);

  ngOnInit() {
    this.tracks.forEach((track, index) => {
      this.forms.insert(
        index,
        new FormGroup({
          path: new FormControl({ value: track.fullPath, disabled: true }),
          title: new FormControl(track.title, [Validators.required]),
          author: new FormControl(track.author || null),
          tags: new FormControl([] as TagData[]),
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
          tags: value.tags?.map((t) => t.id) || [],
        };
      });
      console.log(this.forms.getRawValue());
      //this.dialog.close(result);
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
