import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../../models/track-transition.model';
import { HowlTrack } from '../../../utils/howl-track';

export class IdleState implements TrackTransitionState {
  onEnter(context: TrackTransitionStateContext): void {}

  onExit(context: TrackTransitionStateContext): void {}

  play(context: TrackTransitionStateContext, howlTrack: HowlTrack): void {}

  stop(context: TrackTransitionStateContext): void {}
}
