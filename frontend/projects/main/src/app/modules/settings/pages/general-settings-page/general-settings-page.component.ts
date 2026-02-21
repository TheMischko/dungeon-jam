import { ChangeDetectionStrategy, Component, computed, input, output, TemplateRef, viewChild } from '@angular/core';
import { DiscordTokenData } from '@shared/models/discord.model';
import {
  CollapsibleSectionComponent
} from '@general/components/display/collapsible-section/collapsible-section.component';
import { CollapsibleSectionConfig } from '../../../../../../../general/models/collapsible-section-component.model';

@Component({
  selector: 'app-general-settings-page',
  imports: [
    CollapsibleSectionComponent,
  ],
  templateUrl: './general-settings-page.component.html',
  styleUrl: './general-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsPageComponent {
  readonly tokens = input<DiscordTokenData[]>();
  readonly tokensLoading = input<boolean>();

  readonly createToken = output<DiscordTokenData>();
  readonly updateToken = output<{ token: string, newData: DiscordTokenData }>();
  readonly deleteToken = output<string>();
  readonly connectViaToken = output<string>();

  readonly tokenSectionTemp = viewChild.required<TemplateRef<{$implicit: DiscordTokenData[]}>>('tokensTemp');

  readonly sections = computed<CollapsibleSectionConfig<DiscordTokenData[]>[]>(() => ([
    {
      title: 'Discord Tokens',
      value: [],
      template: this.tokenSectionTemp()
    }
  ]));
}
