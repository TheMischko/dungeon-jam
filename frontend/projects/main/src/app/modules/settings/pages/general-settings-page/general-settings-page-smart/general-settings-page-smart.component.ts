import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DiscordTokenStore } from '@general/stores/discord-token.store';
import { DiscordTokenData } from '@shared/models/discord.model';
import { GeneralSettingsPageComponent } from '../general-settings-page.component';

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

  readonly tokens = this.discordTokenStore.entities;
  readonly tokensLoading = this.discordTokenStore.loading;

  createToken(data: DiscordTokenData): void {
    this.discordTokenStore.createToken(data);
  }

  updateToken(event: { token: string, newData: DiscordTokenData }): void {
    this.discordTokenStore.updateToken(event);
  }

  deleteToken(token: string): void {
    this.discordTokenStore.removeToken(token);
  }

  connectViaToken(token: string): void {
    console.warn('Connect via token not implemented yet', token);
  }
}
