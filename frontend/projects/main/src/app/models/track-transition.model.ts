import { HowlTrack } from '../utils/howl-track';

export interface TrackTransitionStateContext {
  masterVolume: number;
  activeTrack?: HowlTrack;
  nextTrack?: HowlTrack;
  transitionTo(state: TrackTransitionState): void;
}

export interface TrackTransitionState {
  onEnter(context: TrackTransitionStateContext): void;
  onExit(context: TrackTransitionStateContext): void;
  play(context: TrackTransitionStateContext, howlTrack: HowlTrack): void;
  stop(context: TrackTransitionStateContext): void;
}
