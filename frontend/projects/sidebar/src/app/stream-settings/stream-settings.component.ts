import {ChangeDetectionStrategy, Component, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LucideAngularModule, MonitorSpeakerIcon} from 'lucide-angular';

@Component({
  selector: 'app-stream-settings',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './stream-settings.component.html',
  styleUrl: './stream-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamSettingsComponent {

  readonly currentIcon = computed<any>(() => {
    return this.discordPlaybackIcon;
  })

  readonly localPlaybackIcon = MonitorSpeakerIcon;
  readonly discordPlaybackIcon = 'discord';

  isStringIcon(icon: any): boolean {
    return typeof icon === 'string';
  }
}
