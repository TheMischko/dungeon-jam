import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { IdleState } from './idle-state';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Subscription, take } from 'rxjs';
import { PlayingTrackState } from '../../../models/playback.model';
import { CrossfadingToNextState } from './crossfading-to-next-state';
import { FadeOutState } from './fade-out-state';
import { FadeInState } from './fade-in-state';

export class PlayingState implements TrackTransitionState {
  private readonly destroyRef = inject(DestroyRef);

  private trackFadePositionSub: Subscription | undefined;
  private preloadNextTrackSub: Subscription | undefined;
  private trackStoppedSub: Subscription | undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    const activeTrack = context.activeTrack.getValue();
    if (!activeTrack) {
      await context.transitionTo(IdleState);
      return;
    }
    this.subscribeToEvents(context, activeTrack);
  }

  onExit(context: TrackTransitionStateContext): void {
    this.trackFadePositionSub?.unsubscribe();
    this.preloadNextTrackSub?.unsubscribe();
    this.trackStoppedSub?.unsubscribe();
  }

  async play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): Promise<void> {
    context.nextTrack.getValue()?.dispose();
    howlTrack.load();
    context.nextTrack.next(howlTrack);
    await context.transitionTo(CrossfadingToNextState);
  }

  async stop(context: TrackTransitionStateContext): Promise<void> {
    context.activeTrack.getValue()?.dispose();
    context.activeTrack.next(undefined);
    await context.transitionTo(IdleState);
  }

  subscribeToEvents(
    context: TrackTransitionStateContext,
    track: HowlTrack
  ): void {
    this.preloadNextTrackSub = track.position$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(
          (position) =>
            context.crossFadeDuration > 0 &&
            track.track.duration - position <=
              (context.crossFadeDuration / 1000) * 2
        ),
        take(1)
      )
      .subscribe(async () => {
        if (!context.nextTrack.getValue()) {
          const nextTrack = await context.getNextFn();
          if (nextTrack) {
            context.nextTrack.next(nextTrack);
            nextTrack.load();
          }
        }
      });

    this.trackFadePositionSub = track.position$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(
          (position) =>
            context.crossFadeDuration > 0 &&
            track.track.duration - position <= context.crossFadeDuration / 1000
        ),
        take(1)
      )
      .subscribe(async () => {
        const existingNext = context.nextTrack.getValue();
        const nextTrackCandidate = await context.getNextFn();

        let trackToTransition: HowlTrack | undefined;
        if (
          existingNext &&
          nextTrackCandidate &&
          existingNext.track.id === nextTrackCandidate.track.id
        ) {
          nextTrackCandidate.dispose();
          trackToTransition = existingNext;
        } else if (nextTrackCandidate) {
          existingNext?.dispose();
          context.nextTrack.next(nextTrackCandidate);
          nextTrackCandidate.load();
          trackToTransition = nextTrackCandidate;
        } else if (existingNext) {
          trackToTransition = existingNext;
        }

        if (trackToTransition) {
          await context.transitionTo(CrossfadingToNextState);
        } else {
          await context.transitionTo(FadeOutState);
        }
      });

    this.trackStoppedSub = track.state$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((state) => state === PlayingTrackState.ENDED),
        take(1)
      )
      .subscribe(async () => {
        let nextTrack = context.nextTrack.getValue();
        if (!nextTrack) {
          nextTrack = await context.getNextFn();
        }

        if (nextTrack) {
          track.dispose();
          context.activeTrack.next(nextTrack);
          context.nextTrack.next(undefined);
          await context.transitionTo(FadeInState);
          return;
        }

        await context.transitionTo(IdleState);
      });
  }

  toString(): string {
    return 'PlayingState';
  }
}
