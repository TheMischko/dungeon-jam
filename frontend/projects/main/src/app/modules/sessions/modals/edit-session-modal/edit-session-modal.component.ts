import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  createSessionForm,
  SessionForm,
  SessionFormData,
} from '../../../../forms/session-form/session-form.model';
import { SessionInsertQuery } from '@shared/models/session.model';
import { MatButton } from '@angular/material/button';
import { SessionFormComponent } from '../../../../forms/session-form/session-form.component';

@Component({
  selector: 'app-edit-session-modal',
  imports: [MatButton, SessionFormComponent],
  templateUrl: './edit-session-modal.component.html',
  styleUrl: './edit-session-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSessionModalComponent {
  readonly dialog = inject(MatDialogRef<void, EditSessionModalResult>);
  readonly dialogData = inject<EditSessionModalData>(MAT_DIALOG_DATA);

  readonly form: SessionForm = createSessionForm(
    this.dialogData?.formData || {}
  );

  readonly sessionId = this.dialogData?.sessionId;
  readonly title = this.sessionId ? 'Edit session' : 'Create new session';

  cancel(): void {
    this.dialog.close(null);
  }

  save(): void {
    if (this.form().valid()) {
      const formValue = this.form().value();
      this.dialog.close({
        sessionId: this.sessionId,
        name: formValue.name,
        description: formValue.description ?? undefined,
        dateOfSession: formValue.dateOfSession ?? undefined,
      } as EditSessionModalResult);
    }
  }
}

export type EditSessionModalResult =
  | (SessionInsertQuery & {
      sessionId?: string;
    })
  | null;

export type EditSessionModalData = {
  formData?: SessionFormData;
  sessionId?: string;
};
