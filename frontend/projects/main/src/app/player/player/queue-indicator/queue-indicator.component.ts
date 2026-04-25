import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { iconSet } from '@general/icons/icons';
import { PlaybackState } from '../../../models/playback.model';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { ScrollOverflowTextDirective } from '@general/directives/scroll-overflow-text.directive';

@Component({
  selector: 'app-queue-indicator',
  imports: [
    LucideAngularModule,
    MatMenuTrigger,
    MatMenu,
    ScrollOverflowTextDirective,
  ],
  templateUrl: './queue-indicator.component.html',
  styleUrl: './queue-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueIndicatorComponent {
  readonly playback = input.required<PlaybackState>();
  readonly playlistIcon = iconSet.PlaylistIcon;

  readonly queueCount = computed(() => this.playback().queue.length);
  readonly currentTrack = computed(() => this.playback().currentTrack);

  protected preventOnEmptyQueue(event: PointerEvent) {
    if (!this.queueCount()) {
      event.preventDefault();
      event.stopPropagation();
      console.log('prevent');
    }
  }
}
