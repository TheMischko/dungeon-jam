import { Component, computed, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AudioTrack } from '@shared/models/track.model';
import { MatButton } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TagData } from '@shared/models/tag.model';
import { createTrackForm } from '../../../../forms/track-form/track-form.model';
import { TrackFormComponent } from '../../../../forms/track-form/track-form.component';
import { disabled } from '@angular/forms/signals';

export type TracksUploadModalData = {
  title: string;
  tracks?: AudioTrack[];
  tagsMap?: Map<string, TagData>;
};

@Component({
  selector: 'app-tracks-upload-modal',
  imports: [
    MatDialogModule,
    MatButton,
    ReactiveFormsModule,
    TrackFormComponent,
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
  readonly currentForm = computed(() => {
    return this.forms[this.currentStep()];
  });

  readonly forms = this.tracks.map((track) => {
    const form = createTrackForm(
      {
        path: track.fullPath,
        title: track.title,
        author: track.author,
        tags: track.tags?.map((tagLabel) => this.tagsMap.get(tagLabel)).filter((t) => !!t) || [],
      },
      (form) => {
        disabled(form.path);
      },
    );
    return form;
  });

  get title(): string {
    return this.data.title;
  }
  get tracks(): AudioTrack[] {
    return this.data.tracks || [];
  }
  get tagsMap(): Map<string, TagData> {
    return this.data.tagsMap ?? new Map<string, TagData>();
  }

  cancel() {
    this.dialog.close(null);
  }

  nextStep() {
    if (this.currentStep() === this.tracks.length - 1 && this.formsAreValid()) {
      const result: AudioTrack[] = this.forms.map((group, index) => {
        const value = group().value();
        return {
          title: value.title!,
          fullPath: this.tracks[index].fullPath,
          author: value.author || undefined,
          length: this.tracks[index].length,
          tags: value.tags?.map((t) => t.id)?.filter((v) => !!v) || [],
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

  private formsAreValid(): boolean {
    return this.forms.every((form) => form().valid());
  }
}
