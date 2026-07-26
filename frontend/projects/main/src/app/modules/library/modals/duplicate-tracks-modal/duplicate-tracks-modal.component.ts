import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Track } from '@shared/models/track.model';

export type DuplicateTracksModalData = {
  duplicates: { path: string; track: Track }[];
};

export type DuplicateTracksModalResult = 'override' | 'skip';

@Component({
  selector: 'app-duplicate-tracks-modal',
  imports: [MatButton],
  templateUrl: './duplicate-tracks-modal.component.html',
  styleUrl: './duplicate-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DuplicateTracksModalComponent {
  readonly data = inject<DuplicateTracksModalData>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);

  get duplicates(): { path: string; track: Track }[] {
    return this.data.duplicates;
  }

  override(): void {
    const result: DuplicateTracksModalResult = 'override';
    this.dialog.close(result);
  }

  skip(): void {
    const result: DuplicateTracksModalResult = 'skip';
    this.dialog.close(result);
  }

  cancel(): void {
    this.dialog.close(undefined);
  }
}

