import { ChangeDetectionStrategy, Component, computed, input, output, TemplateRef, viewChild } from '@angular/core';
import { DiscordTokenData } from '@shared/models/discord.model';
import {
  CollapsibleSectionComponent
} from '@general/components/display/collapsible-section/collapsible-section.component';
import { CollapsibleSectionConfig } from '../../../../../../../general/models/collapsible-section-component.model';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-general-settings-page',
  imports: [
    CollapsibleSectionComponent,
    IconButtonComponent,
    SlicePipe,
  ],
  templateUrl: './general-settings-page.component.html',
  styleUrl: './general-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GeneralSettingsPageComponent {
  readonly tokens = input<DiscordTokenData[]>();
  readonly tokensLoading = input<boolean>();

  readonly editToken = output<DiscordTokenData>();
  readonly deleteToken = output<string>();

  readonly tokenSectionTemp = viewChild.required<TemplateRef<{$implicit: DiscordTokenData[]}>>('tokensTemp');

  readonly icons = {
    Edit: actionsIconSet.EditIcon,
    Delete: actionsIconSet.DeleteIcon,
  };

  readonly iconColors = {
    edit: 'neutral',
    delete: 'neutral',
  };

  readonly sections = computed<CollapsibleSectionConfig<DiscordTokenData[]>[]>(() => ([
    {
      title: 'Discord Tokens',
      value: [],
      template: this.tokenSectionTemp()
    }
  ]));

  onEditToken(token: DiscordTokenData): void {
    this.editToken.emit(token);
  }

  onDeleteToken(id: string): void {
    this.deleteToken.emit(id);
  }
}
