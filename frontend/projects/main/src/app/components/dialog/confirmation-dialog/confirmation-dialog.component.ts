import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButton],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly dialogData: ConfirmationDialogData = inject(DIALOG_DATA);
  readonly dialogRef = inject(
    MatDialogRef<ConfirmationDialogComponent, boolean>
  );

  get title() {
    if (this.dialogData && this.dialogData.title) {
      return this.dialogData.title;
    }
    return 'Are you sure?';
  }

  get message() {
    return this.dialogData.message ?? '';
  }

  get confirmText() {
    return this.dialogData?.confirmText ?? 'Yes';
  }

  get dismissText() {
    return this.dialogData?.dismissText ?? 'No';
  }

  confirm() {
    this.dialogRef.close(true);
  }

  reject() {
    this.dialogRef.close(false);
  }
}

export type ConfirmationDialogData = {
  title: string;
  message: string;
  confirmText?: string;
  dismissText?: string;
};
