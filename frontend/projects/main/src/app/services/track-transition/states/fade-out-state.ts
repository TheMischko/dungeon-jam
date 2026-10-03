import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { IdleState } from './idle-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FadeInState } from './fade-in-state';

export class FadeOutState implements TrackTransitionState {
  private readonly destroyRef = inject(DestroyRef);

  private fadeOutSub: Subscription | undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    const activeTrack = context.activeTrack.getValue();
    if (!activeTrack) {
      await context.transitionTo(IdleState);
      return;
    }

    this.fadeOutSub = activeTrack
      .fade(1, 0, context.crossFadeDuration)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: async () => {
          const nextTrack = await context.getNextFn();
          if (nextTrack) {
            activeTrack.dispose();
            context.activeTrack.next(nextTrack);
            await context.transitionTo(FadeInState);
            return;
          }
          await context.transitionTo(IdleState);
        },
      });
  }

  onExit(): void {
    this.fadeOutSub?.unsubscribe();
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
    return 'FadeOutState';
  }
}
