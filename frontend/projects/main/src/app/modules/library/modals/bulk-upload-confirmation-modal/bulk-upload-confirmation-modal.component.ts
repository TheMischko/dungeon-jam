import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export type BulkUploadConfirmationModalData = {
  count: number;
};

export type BulkUploadConfirmationModalResult = 'manual' | 'autoresolve';

@Component({
  selector: 'app-bulk-upload-confirmation-modal',
  imports: [MatButton],
  templateUrl: './bulk-upload-confirmation-modal.component.html',
  styleUrl: './bulk-upload-confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BulkUploadConfirmationModalComponent {
  readonly data = inject<BulkUploadConfirmationModalData>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);

  get count(): number {
    return this.data.count;
  }

  reviewManually(): void {
    const result: BulkUploadConfirmationModalResult = 'manual';
    this.dialog.close(result);
  }

  autoResolve(): void {
    const result: BulkUploadConfirmationModalResult = 'autoresolve';
    this.dialog.close(result);
  }

  cancel(): void {
    this.dialog.close(undefined);
  }
}
