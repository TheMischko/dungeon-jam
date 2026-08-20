import { DestroyRef, inject, Service } from '@angular/core';
import { LoadSoundService } from '../load-sound.service';
import { HowlTrack } from '../../utils/howl-track';
import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../models/track-transition.model';
import { IdleState } from './states/idle-state';
import { Track } from '@shared/models/track.model';

@Service()
export class TrackTransitionService implements TrackTransitionStateContext {
  private readonly loadSoundService = inject(LoadSoundService);
  private readonly destroyRef = inject(DestroyRef);

  masterVolume: number = 1;
  activeTrack?: HowlTrack | undefined;
  nextTrack?: HowlTrack | undefined;

  private currentState: TrackTransitionState = new IdleState();

  transitionTo(nextState: TrackTransitionState): void {
    this.currentState.onExit(this);
    this.currentState = nextState;
    this.currentState.onEnter(this);
  }

  async play(track: Track) {
    const trackData = await this.loadSoundService.loadTrack(track);
    const howlTrack = new HowlTrack(trackData);

    this.currentState.play(this, howlTrack);
  }

  stop() {
    this.currentState.stop(this);
  }
}
