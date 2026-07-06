import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  isDevMode,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  LucideIconData,
  MonitorSpeakerIcon,
} from 'lucide-angular';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {
  ActionsMenuBaseConfig,
  ActionsMenuComponent,
} from '@general/components/display/actions-menu/actions-menu.component';
import { DiscordService } from '@general/services/discord.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ChannelData,
  DiscordStateConnected,
  DiscordStateType,
  GuildWithChannels,
} from '@shared/models/discord.model';
import { DiscordTokenStore } from '@general/stores/discord-token.store';

type PlaybackApiWindow = Window & {
  PLAYBACK_API: {
    updateCaptureSettings: (isLocalMuted: boolean) => void;
  };
};

@Component({
  selector: 'app-stream-settings',
  imports: [
    CommonModule,
    LucideAngularModule,
    MatMenu,
    ActionsMenuComponent,
    MatMenuTrigger,
  ],
  templateUrl: './stream-settings.component.html',
  styleUrl: './stream-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamSettingsComponent implements OnInit, AfterViewInit {
  private readonly window = window as unknown as PlaybackApiWindow;
  readonly discordService = inject(DiscordService);
  readonly discordTokenStore = inject(DiscordTokenStore);
  readonly currentStreamDestination = computed<'local' | DiscordPlaybackInfo>(
    () => {
      const discordState = this.discordState();
      if (discordState.type === DiscordStateType.CONNECTED) {
        return {
          guildId: discordState.guildId,
          guildName: discordState.guildName,
          channelId: discordState.channelId,
          channelName: discordState.channelName,
          tokenId: discordState.tokenId,
        };
      }
      return 'local';
    }
  );

  readonly tokenChannelsMap = this.discordTokenStore.channelsMap;

  readonly discordState = toSignal(this.discordService.discordState$, {
    initialValue: { type: DiscordStateType.NONE },
  });
  readonly currentIcon = computed<any>(() => {
    if (this.isDiscordPlayback()) {
      return this.discordPlaybackIcon;
    }
    return this.localPlaybackIcon;
  });

  readonly localStreamText = 'Playing locally';

  readonly localPlaybackIcon = MonitorSpeakerIcon;
  readonly discordPlaybackIcon = 'discord';

  readonly serversFlattened = computed<ActionsMenuBaseConfig<null>[]>(() => {
    const channelsMap = this.tokenChannelsMap();
    return Object.keys(channelsMap).reduce((channels, tokenId, _, __) => {
      const serverData = channelsMap[tokenId];
      const serverChannelActions = serverData.flatMap((guild) => {
        return guild.channels.map((channel) =>
          this.mapServerChannelToActionConfig(guild, channel, tokenId)
        );
      });
      return [...channels, ...serverChannelActions];
    }, [] as ActionsMenuBaseConfig<null>[]);
  });

  readonly actionMenuConfig = computed<ActionsMenuBaseConfig<null>[]>(() => {
    return [
      {
        text: 'Local playback',
        icon: this.localPlaybackIcon,
        cssClasses: this.isActive() ? ['active'] : [],
        onSelected: () => this.switchToLocalPlayback(),
      },
      ...this.serversFlattened(),
    ];
  });

  readonly isDiscordPlayback = computed<boolean>(() => {
    return this.currentStreamDestination() !== 'local';
  });
  readonly discordPlayback = computed<DiscordStateConnected>(() => {
    const destination = this.currentStreamDestination();
    if (destination === 'local') {
      throw new Error('Not in Discord playback mode');
    }
    return destination as DiscordStateConnected;
  });

  readonly isActive = (activeId: string | null = null) => {
    const destination = this.currentStreamDestination();
    if (destination === 'local' && activeId === null) {
      return true;
    }
    if (destination !== 'local' && activeId !== null) {
      if (activeId === destination.channelId) {
        return true;
      }
      if (activeId === destination.guildId) {
        return true;
      }
    }
    return false;
  };

  ngOnInit() {
    this.discordTokenStore.loadTokens();
  }

  ngAfterViewInit() {
    if (isDevMode()) {
      setTimeout(() => this.switchToLocalPlayback(), 5000);
    }
  }

  isStringIcon(icon: any): boolean {
    return typeof icon === 'string';
  }

  switchToLocalPlayback(): void {
    this.discordService.disconnect().subscribe();
    // When switching to local playback, unmute the capture (isLocalMuted = false)
    // This allows audio to be heard through speakers
    this.window.PLAYBACK_API.updateCaptureSettings(false);
  }

  switchToDiscordPlayback(discordInfo: DiscordPlaybackInfo): void {
    this.discordService
      .joinChannel(
        discordInfo.guildId,
        discordInfo.channelId,
        discordInfo.tokenId
      )
      .subscribe();
    // When switching to Discord playback, mute the capture (isLocalMuted = true)
    // This prevents audio from playing through speakers
    this.window.PLAYBACK_API.updateCaptureSettings(true);
  }

  private mapServerChannelToActionConfig(
    guild: GuildWithChannels,
    channel: ChannelData,
    tokenId: string
  ): ActionsMenuBaseConfig<null> {
    return {
      text: `${guild.guildName} - ${channel.name}`,
      icon: this.discordPlaybackIcon as unknown as LucideIconData,
      cssClasses: ['discord-icon'],
      onSelected: () => {
        this.switchToDiscordPlayback({
          guildId: guild.guildId,
          guildName: guild.guildName,
          channelId: channel.id,
          channelName: channel.name,
          tokenId,
        });
      },
    };
  }
}

type DiscordPlaybackInfo = {
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  tokenId: string;
};
