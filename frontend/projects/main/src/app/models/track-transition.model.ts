import { HowlTrack } from '../utils/howl-track';
import { Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TrackTransitionStateContext {
  masterVolume: number;
  fadeDuration: number;
  getNextFn: () => Promise<HowlTrack | undefined>;
  activeTrack: BehaviorSubject<HowlTrack | undefined>;
  nextTrack: BehaviorSubject<HowlTrack | undefined>;
  transitionTo(stateType: Type<TrackTransitionState>): Promise<void>;
}

export interface TrackTransitionState {
  toString(): string;
  onEnter(context: TrackTransitionStateContext): void | Promise<void>;
  onExit(context: TrackTransitionStateContext): void | Promise<void>;
  play(
    context: TrackTransitionStateContext,
    howlTrack: HowlTrack
  ): void | Promise<void>;
  stop(context: TrackTransitionStateContext): void | Promise<void>;
}
