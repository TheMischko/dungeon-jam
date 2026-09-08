import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  DiscordStateType,
  DiscordTokenData,
} from '@shared/models/discord.model';
import { CollapsibleSectionComponent } from '@general/components/display/collapsible-section/collapsible-section.component';
import { CollapsibleSectionConfig } from '@general/models/collapsible-section-component.model';
import { MatButton } from '@angular/material/button';
import { TokenBoxComponent } from '../../components/token-box/token-box.component';
import { StoredTransitionSettings } from '@shared/models/track.model';
import { PlaybackTransitionSectionComponent } from '../../components/playback-transition-section/playback-transition-section.component';

@Component({
  selector: 'app-general-settings-page',
  imports: [
    CollapsibleSectionComponent,
    MatButton,
    TokenBoxComponent,
    PlaybackTransitionSectionComponent,
  ],
  templateUrl: './general-settings-page.component.html',
  styleUrl: './general-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GeneralSettingsPageComponent {
  readonly tokens = input<DiscordTokenData[]>();
  readonly tokenConnectionMap = input<Record<string, DiscordStateType>>({});
  readonly tokensLoading = input<boolean>();
  readonly appVersion = input<string>('0.0.0');
  readonly transitionSettings = input.required<StoredTransitionSettings>();

  readonly editToken = output<DiscordTokenData>();
  readonly deleteToken = output<string>();
  readonly createToken = output<void>();
  readonly toggleTokenConnection = output<DiscordTokenData>();
  readonly openLogsDir = output<void>();
  readonly updateTransitionSettings = output<StoredTransitionSettings>();
  readonly checkUpdates = output<void>();

  readonly tokenSectionTemp =
    viewChild.required<TemplateRef<{ $implicit: DiscordTokenData[] }>>(
      'tokensTemp'
    );
  readonly playbackSectionTemp =
    viewChild.required<TemplateRef<{ $implicit: DiscordTokenData[] }>>(
      'playbackTemp'
    );

  readonly sections = computed<CollapsibleSectionConfig<DiscordTokenData[]>[]>(
    () => [
      {
        title: 'Discord Tokens',
        value: [],
        template: this.tokenSectionTemp(),
      },
      {
        title: 'Playback settings',
        value: [],
        template: this.playbackSectionTemp(),
      },
    ]
  );

  onCreateToken(): void {
    this.createToken.emit();
  }

  onEditToken(token: DiscordTokenData): void {
    this.editToken.emit(token);
  }

  onDeleteToken(id: string): void {
    this.deleteToken.emit(id);
  }
}
