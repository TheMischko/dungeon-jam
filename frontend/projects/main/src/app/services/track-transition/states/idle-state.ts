import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { FadeInState } from './fade-in-state';

/**
 * Stops and dispose both active and next tracks.
 */
export class IdleState implements TrackTransitionState {
  onEnter(context: TrackTransitionStateContext): void {
    context.activeTrack.getValue()?.dispose();
    context.nextTrack.getValue()?.dispose();
    context.activeTrack.next(undefined);
    context.nextTrack.next(undefined);
  }

  onExit(context: TrackTransitionStateContext): void {}

  async play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): Promise<void> {
    howlTrack.load();
    context.activeTrack.next(howlTrack);
    await context.transitionTo(FadeInState);
  }

  stop(context: TrackTransitionStateContext): void {}

  toString(): string {
    return 'IdleState';
  }
}
