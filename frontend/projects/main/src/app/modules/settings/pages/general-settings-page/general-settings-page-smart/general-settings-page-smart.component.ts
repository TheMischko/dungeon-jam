import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DiscordTokenStore } from '@general/stores/discord-token.store';
import { DiscordTokenData, DiscordTokenUpdateData } from '@shared/models/discord.model';
import { GeneralSettingsPageComponent } from '../general-settings-page.component';
import { MatDialog } from '@angular/material/dialog';
import { EditDiscordTokenModalComponent } from '../../../modals/edit-discord-token-modal/edit-discord-token-modal.component';

@Component({
  selector: 'app-general-settings-page-smart',
  imports: [
    GeneralSettingsPageComponent,
  ],
  templateUrl: './general-settings-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsPageSmartComponent {
  private readonly discordTokenStore = inject(DiscordTokenStore);
  private readonly dialog = inject(MatDialog);

  readonly tokens = this.discordTokenStore.entities;
  readonly tokensLoading = this.discordTokenStore.loading;

  editToken(token: DiscordTokenData): void {
    const dialogRef = this.dialog.open(EditDiscordTokenModalComponent, {
      width: '600px',
      data: token,
    });

    dialogRef.afterClosed().subscribe((result: DiscordTokenUpdateData | null) => {
      if (result) {
        this.discordTokenStore.updateToken({ id: token.id, newData: result });
      }
    });
  }

  deleteToken(id: string): void {
    this.discordTokenStore.removeToken(id);
  }
}
