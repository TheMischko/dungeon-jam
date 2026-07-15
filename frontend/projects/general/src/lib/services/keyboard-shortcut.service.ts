import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { isTypingOrInteractiveTarget } from '@general/utils/is-typing-target';

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutService {
  private readonly playPauseToggle = new Subject<void>();
  readonly playPauseToggle$ = this.playPauseToggle.asObservable();

  private readonly closeSignal = new Subject<void>();
  readonly closeSignal$ = this.closeSignal.asObservable();

  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.listenForPlayPauseToggle(event);
      this.listenForEscapeKeydown(event);
    });
  }

  private listenForPlayPauseToggle(event: KeyboardEvent): void {
    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    if (isTypingOrInteractiveTarget(event.target)) {
      return;
    }
    event.preventDefault();
    this.playPauseToggle.next();
  }

  private listenForEscapeKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    if (isTypingOrInteractiveTarget(event.target)) {
      if (event.target) {
        (event.target as HTMLElement).blur();
      }
      return;
    }
    event.preventDefault();
    this.closeSignal.next();
  }
}
