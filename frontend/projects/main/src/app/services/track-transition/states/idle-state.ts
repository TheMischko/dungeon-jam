import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';
import { PlayingState } from './playing-state';

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
    context.activeTrack.next(howlTrack);
    await context.transitionTo(PlayingState);
    await howlTrack.play();
  }

  stop(context: TrackTransitionStateContext): void {}

  toString(): string {
    return 'IdleState';
  }
}
