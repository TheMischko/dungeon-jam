import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DiscordTokenStore } from '@general/stores/discord-token.store';
import {
  DiscordStateType,
  DiscordTokenData,
  DiscordTokenUpdateData,
} from '@shared/models/discord.model';
import { GeneralSettingsPageComponent } from '../general-settings-page.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditDiscordTokenModalComponent } from '../../../modals/edit-discord-token-modal/edit-discord-token-modal.component';

@Component({
  selector: 'app-general-settings-page-smart',
  imports: [GeneralSettingsPageComponent],
  templateUrl: './general-settings-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsPageSmartComponent {
  private readonly discordTokenStore = inject(DiscordTokenStore);
  private readonly dialog = inject(MatDialog);

  readonly tokens = this.discordTokenStore.entities;
  readonly tokensLoading = this.discordTokenStore.loading;
  readonly tokenConnectionMap = this.discordTokenStore.connectionMap;

  editToken(token: DiscordTokenData): void {
    const dialogRef = this.createDiscordTokenDialog(token);

    dialogRef
      .afterClosed()
      .subscribe((result: DiscordTokenUpdateData | null) => {
        if (result) {
          this.discordTokenStore.updateToken({ id: token.id, newData: result });
        }
      });
  }

  createToken(): void {
    const dialogRef = this.createDiscordTokenDialog();

    dialogRef
      .afterClosed()
      .subscribe((result: DiscordTokenUpdateData | null) => {
        if (result) {
          this.discordTokenStore.createToken(result);
        }
      });
  }

  deleteToken(id: string): void {
    this.discordTokenStore.removeToken(id);
  }

  toggleTokenState(token: DiscordTokenData): void {
    if (this.tokenConnectionMap()[token.id] === DiscordStateType.CONNECTING) {
      return;
    }
    if (this.tokenConnectionMap()[token.id] === DiscordStateType.CONNECTED) {
      this.discordTokenStore.disconnectToken(token);
      return;
    }
    this.discordTokenStore.connectToken(token);
  }

  private createDiscordTokenDialog(
    data?: DiscordTokenUpdateData
  ): MatDialogRef<EditDiscordTokenModalComponent> {
    return this.dialog.open(EditDiscordTokenModalComponent, {
      width: '600px',
      data: data ?? null,
    });
  }
}
