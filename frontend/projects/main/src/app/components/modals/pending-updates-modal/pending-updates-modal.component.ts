import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUpdateInfo } from '@shared/models/application.model';
import { MatButton } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-pending-updates-modal',
  imports: [MatButton],
  templateUrl: './pending-updates-modal.component.html',
  styleUrl: './pending-updates-modal.component.scss',
})
export class PendingUpdatesModalComponent {
  readonly sanitizer = inject(DomSanitizer);
  readonly dialogRef = inject(MatDialogRef<PendingUpdatesModalComponent>);
  readonly data: { updates: AppUpdateInfo[] } = inject(MAT_DIALOG_DATA);

  get updates() {
    return (
      this.data.updates.map((update) => ({
        version: update.version,
        note: this.sanitizer.bypassSecurityTrustHtml(
          update.note ?? 'No content.'
        ),
      })) ?? []
    );
  }

  cancel() {
    this.dialogRef.close();
  }
}
