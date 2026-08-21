import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { IdleState } from './idle-state';
import { DestroyRef, inject } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayingState } from './playing-state';

export class CrossfadingToNextState implements TrackTransitionState {
  private destroyRef = inject(DestroyRef);

  private crossfadeFinishSub: Subscription | undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    if (!context.activeTrack.getValue()) {
      await context.transitionTo(IdleState);
      return;
    }
    const nextTrack = context.nextTrack.getValue();
    if (!nextTrack) {
      // Fade out
      await context.transitionTo(IdleState);
      return;
    }

    await nextTrack.play();
    await this.startCrossfade(context);
  }

  onExit(context: TrackTransitionStateContext): void {
    this.crossfadeFinishSub?.unsubscribe();
  }

  play(context: TrackTransitionStateContext, howlTrack: HowlTrack): void {}

  stop(context: TrackTransitionStateContext): void {}

  async startCrossfade(context: TrackTransitionStateContext): Promise<void> {
    const currentTrack = context.activeTrack.getValue();
    const nextTrack = context.nextTrack.getValue();
    const fadeDuration = context.fadeDuration;
    if (!currentTrack || !nextTrack) {
      await context.transitionTo(IdleState);
      return;
    }
    this.crossfadeFinishSub = forkJoin([
      currentTrack.fade(1, 0, fadeDuration * 1000),
      nextTrack.fade(0, 1, fadeDuration * 1000),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async () => {
        currentTrack.dispose();
        context.activeTrack.next(nextTrack);
        context.nextTrack.next(undefined);
        await context.transitionTo(PlayingState);
      });
  }

  toString(): string {
    return 'CrossfadingToNextState';
  }
}
