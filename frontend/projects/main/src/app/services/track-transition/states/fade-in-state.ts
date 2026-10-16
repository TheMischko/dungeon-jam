import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { IdleState } from './idle-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';
import { PlayingState } from './playing-state';
import { Subscription } from 'rxjs';

/**
 * Starts playing and fades in current active song.
 */
export class FadeInState implements TrackTransitionState {
  readonly destroyRef = inject(DestroyRef);

  private fadeInSub: Subscription | undefined = undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    const track = context.activeTrack.getValue();
    if (!track) {
      await context.transitionTo(IdleState);
      return;
    }

    await track.play();
    this.fadeInSub = track
      .fade(0, 1, context.fadeInDuration)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        context.transitionTo(PlayingState);
      });
  }

  onExit(context: TrackTransitionStateContext): void {
    this.fadeInSub?.unsubscribe();
  }

  async play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): Promise<void> {
    howlTrack.load();
    context.activeTrack.getValue()?.dispose();
    context.activeTrack.next(howlTrack);
    await context.transitionTo(FadeInState);
  }

  async stop(context: TrackTransitionStateContext): Promise<void> {
    await context.transitionTo(IdleState);
  }

  toString(): string {
    return 'FadeInState';
  }
}
