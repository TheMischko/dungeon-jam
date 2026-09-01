import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { IdleState } from './idle-state';
import { DestroyRef, inject } from '@angular/core';
import { debounceTime, filter, forkJoin, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayingState } from './playing-state';
import { FadeInState } from './fade-in-state';
import { PlayingTrackState } from '../../../models/playback.model';

/**
 * Fades out currently playing song, while starts playing and fades in the next song.
 */
export class CrossfadingToNextState implements TrackTransitionState {
  private destroyRef = inject(DestroyRef);

  private crossfadeFinishSub: Subscription | undefined;
  private songFinishedSub: Subscription | undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    const activeTrack = context.activeTrack.getValue();
    if (!activeTrack) {
      await context.transitionTo(IdleState);
      return;
    }
    this.songFinishedSub = activeTrack.state$
      .pipe(
        filter((state) => state === PlayingTrackState.ENDED),
        debounceTime(3000)
      )
      .subscribe(async () => {
        if (context.nextTrack.getValue()) {
          return;
        }
        await context.transitionTo(IdleState);
      });
    const nextTrack = context.nextTrack.getValue();
    if (!nextTrack) {
      await context.transitionTo(IdleState);
      return;
    }

    await nextTrack.play();
    await this.startCrossfade(context);
  }

  onExit(context: TrackTransitionStateContext): void {
    this.crossfadeFinishSub?.unsubscribe();
    this.songFinishedSub?.unsubscribe();
  }

  async play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): Promise<void> {
    const formerNextTrack = context.nextTrack?.getValue();
    if (formerNextTrack && formerNextTrack.track.id === howlTrack.track.id) {
      return;
    }
    howlTrack.load();
    formerNextTrack?.dispose();
    context.activeTrack?.getValue()?.dispose();
    context.nextTrack.next(undefined);
    context.activeTrack.next(howlTrack);
    await context.transitionTo(FadeInState);
  }

  async stop(context: TrackTransitionStateContext): Promise<void> {
    await context.transitionTo(IdleState);
  }

  async startCrossfade(context: TrackTransitionStateContext): Promise<void> {
    const currentTrack = context.activeTrack.getValue();
    const nextTrack = context.nextTrack.getValue();
    const fadeDuration = context.crossFadeDuration;
    if (!currentTrack || !nextTrack) {
      await context.transitionTo(IdleState);
      return;
    }
    context.activeTrack.next(nextTrack);
    context.nextTrack.next(undefined);
    this.crossfadeFinishSub = forkJoin([
      currentTrack.fade(1, 0, this.getFadeOutDuration(fadeDuration)),
      nextTrack.fade(0, 1, fadeDuration),
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

  private getFadeOutDuration(baseDuration: number): number {
    return Math.floor(baseDuration * 0.8);
  }
}
