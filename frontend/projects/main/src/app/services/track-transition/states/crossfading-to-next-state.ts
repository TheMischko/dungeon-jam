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
import { FadeInState } from './fade-in-state';
import { FadeOutState } from './fade-out-state';

/**
 * Fades out currently playing song, while starts playing and fades in the next song.
 */
export class CrossfadingToNextState implements TrackTransitionState {
  private destroyRef = inject(DestroyRef);

  private fadingOutTrack: HowlTrack | undefined;

  private crossfadeFinishSub: Subscription | undefined;

  async onEnter(context: TrackTransitionStateContext): Promise<void> {
    const activeTrack = context.activeTrack.getValue();
    const nextTrack = context.nextTrack.getValue();

    if (!activeTrack) {
      if (nextTrack) {
        context.activeTrack.next(nextTrack);
        context.nextTrack.next(undefined);
        await context.transitionTo(FadeInState);
        return;
      }
      await context.transitionTo(IdleState);
      return;
    }

    if (!nextTrack) {
      await context.transitionTo(PlayingState);
      return;
    }

    await nextTrack.play();
    await this.startCrossfade(context);
  }

  onExit(context: TrackTransitionStateContext): void {
    this.crossfadeFinishSub?.unsubscribe();
    this.fadingOutTrack?.dispose();
    this.fadingOutTrack = undefined;
  }

  async play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): Promise<void> {
    const formerNextTrack = context.nextTrack?.getValue();
    if (formerNextTrack && formerNextTrack.track.id === howlTrack.track.id) {
      return;
    }
    this.fadingOutTrack?.dispose();
    this.fadingOutTrack = undefined;
    howlTrack.load();
    formerNextTrack?.dispose();
    context.activeTrack?.getValue()?.dispose();
    context.nextTrack.next(undefined);
    context.activeTrack.next(howlTrack);
    await context.transitionTo(FadeInState);
  }

  async stop(context: TrackTransitionStateContext): Promise<void> {
    this.fadingOutTrack?.dispose();
    this.fadingOutTrack = undefined;
    await context.transitionTo(IdleState);
  }

  async startCrossfade(context: TrackTransitionStateContext): Promise<void> {
    const currentTrack = context.activeTrack.getValue();
    const nextTrack = context.nextTrack.getValue();
    const fadeDuration = context.crossFadeDuration;
    if (!currentTrack && !nextTrack) {
      await context.transitionTo(IdleState);
      return;
    }
    if (!nextTrack) {
      await context.transitionTo(FadeOutState);
      return;
    }
    if (!currentTrack) {
      context.activeTrack.next(nextTrack);
      await context.transitionTo(FadeInState);
      return;
    }

    this.fadingOutTrack = currentTrack;
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

  pause(context: TrackTransitionStateContext) {
    context.activeTrack.getValue()?.pause();
    context.nextTrack.getValue()?.pause();
    this.fadingOutTrack?.pause();
  }

  resume(context: TrackTransitionStateContext) {
    context.activeTrack.getValue()?.resume();
    context.nextTrack.getValue()?.resume();
    this.fadingOutTrack?.resume();
  }

  toString(): string {
    return 'CrossfadingToNextState';
  }

  private getFadeOutDuration(baseDuration: number): number {
    return Math.floor(baseDuration * 0.8);
  }
}
