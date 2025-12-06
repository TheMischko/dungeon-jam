import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
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
export class StreamSettingsComponent implements AfterViewInit {
  private readonly window = window as unknown as PlaybackApiWindow;
  readonly currentStreamDestination = signal<'local' | 'discord'>('local');
  readonly availableDiscordChannels = signal<string[]>(['Velký stůl']);
  readonly availableDiscordServers = signal<string[]>(['Zaplivaná knajpa']);

  readonly currentIcon = computed<any>(() => {
    if (this.currentStreamDestination() === 'discord') {
      return this.discordPlaybackIcon;
    }
    return this.localPlaybackIcon;
  });

  readonly localStreamText = 'Playing locally';

  readonly localPlaybackIcon = MonitorSpeakerIcon;
  readonly discordPlaybackIcon = 'discord';

  readonly actionMenuConfig = computed<ActionsMenuBaseConfig<null>[]>(() => {
    return [
      {
        text: 'Local playback',
        icon: this.localPlaybackIcon,
        onSelected: () => this.switchToLocalPlayback(),
      },
      {
        text: 'Discord playback',
        icon: this.discordPlaybackIcon as unknown as LucideIconData,
        cssClasses: ['discord-icon'],
        onSelected: () => this.switchToDiscordPlayback(),
      },
    ];
  });

  readonly isDiscordPlayback = computed<boolean>(() => {
    return this.currentStreamDestination() === 'discord';
  });

  ngAfterViewInit() {
    setTimeout(() => {
      this.switchToLocalPlayback();
    }, 5000);
  }

  isStringIcon(icon: any): boolean {
    return typeof icon === 'string';
  }

  switchToLocalPlayback(): void {
    this.currentStreamDestination.set('local');
    // When switching to local playback, unmute the capture (isLocalMuted = false)
    // This allows audio to be heard through speakers
    this.window.PLAYBACK_API.updateCaptureSettings(false);
  }

  switchToDiscordPlayback(): void {
    this.currentStreamDestination.set('discord');
    // When switching to Discord playback, mute the capture (isLocalMuted = true)
    // This prevents audio from playing through speakers
    this.window.PLAYBACK_API.updateCaptureSettings(true);
  }
}
