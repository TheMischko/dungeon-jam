import {
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { TrackDurationPipe } from '../../../../../../general/src/lib/pipes/track-duration.pipe';

@Component({
  selector: 'app-player-bar',
  imports: [NgStyle, TrackDurationPipe],
  templateUrl: './player-bar.component.html',
  styleUrl: './player-bar.component.scss',
})
export class PlayerBarComponent {
  // Current play position of the current track.
  readonly position = input.required<number>();
  // Length of current track.
  readonly duration = input.required<number>();

  readonly percentage = computed(() => {
    return (this.position() / this.duration()) * 100;
  });
  readonly fillWidthStyle = computed(() => {
    return { width: `${this.percentage().toFixed(2)}%` };
  });
  readonly pointerLeftStyle = computed(() => {
    return { left: `${(this.percentage() - 1).toFixed(2)}%` };
  });

  readonly seek = output<number>();

  readonly seeking = signal<boolean>(false);
  readonly progressBar = viewChild('progressBar', {
    read: ElementRef<HTMLElement>,
  });
  readonly progressBarRect = computed(() => {
    return this.progressBar()?.nativeElement.getBoundingClientRect();
  });

  mouseOverBar(event: MouseEvent) {
    if (this.seeking()) {
      const relativePov = this.getMouseRelativePos(event);
      this.seek.emit(relativePov * this.duration());
    }
  }

  mouseDown() {
    this.seeking.set(true);
  }

  mouseUp(event: MouseEvent) {
    const relativePov = this.getMouseRelativePos(event);
    this.seeking.set(false);
    this.seek.emit(relativePov * this.duration());
  }

  blockEvent(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }

  private getMouseRelativePos(event: MouseEvent) {
    const targetRect = this.progressBarRect();
    if (!targetRect) {
      return 0;
    }

    return Math.min(
      1,
      Math.max(
        0,
        (event.clientX - targetRect.left) /
          (targetRect.right - targetRect.left),
      ),
    );
  }
}
