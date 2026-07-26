import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { DiscordTokenData } from '@shared/models/discord.model';
import { DiscordTokenFormComponent } from '../../../../forms/discord-token-form/discord-token-form.component';
import { createDiscordTokenForm } from '../../../../forms/discord-token-form/discord-token-form.model';

@Component({
  selector: 'app-edit-discord-token-modal',
  imports: [MatButton, DiscordTokenFormComponent],
  templateUrl: './edit-discord-token-modal.component.html',
  styleUrl: './edit-discord-token-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class EditDiscordTokenModalComponent {
  readonly dialog = inject(MatDialogRef<void, DiscordTokenData>);
  readonly data = inject<DiscordTokenData>(MAT_DIALOG_DATA);

  readonly form = createDiscordTokenForm(this.data);

  cancel(): void {
    this.dialog.close(null);
  }

  save(): void {
    if (this.form().valid()) {
      const formValue = this.form().value();
      this.dialog.close({
        name: formValue.name,
        apiKey: formValue.apiKey,
      });
    }
  }
}

