import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AudioTrack } from '@shared/models/track.model';

export type TracksUploadModalData = {
  title: string;
  tracks?: AudioTrack[];
};

@Component({
  selector: 'app-tracks-upload-modal',
  imports: [MatDialogModule],
  templateUrl: './tracks-upload-modal.component.html',
  styleUrl: './tracks-upload-modal.component.scss',
  standalone: true,
})
export class TracksUploadModalComponent {
  readonly data = inject<TracksUploadModalData>(MAT_DIALOG_DATA);

  get title(): string {
    return this.data.title;
  }

  get tracks(): AudioTrack[] {
    return this.data.tracks || [];
  }
}
