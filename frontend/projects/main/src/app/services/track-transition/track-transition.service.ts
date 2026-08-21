import {
  inject,
  Injector,
  runInInjectionContext,
  Service,
  Type,
} from '@angular/core';
import { LoadSoundService } from '../load-sound.service';
import { HowlTrack } from '../../utils/howl-track';
import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../models/track-transition.model';
import { IdleState } from './states/idle-state';
import { Track } from '@shared/models/track.model';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { PlayingTrackState } from '../../models/playback.model';

@Service()
export class TrackTransitionService implements TrackTransitionStateContext {
  private readonly loadSoundService = inject(LoadSoundService);
  private readonly injector = inject(Injector);

  masterVolume: number = 1;
  fadeDuration: number = 10;
  pullNextTrackFn: () => Track | undefined = () => undefined;
  readonly activeTrack = new BehaviorSubject<HowlTrack | undefined>(undefined);
  readonly nextTrack = new BehaviorSubject<HowlTrack | undefined>(undefined);

  private currentState: TrackTransitionState = new IdleState();
  private transitionQueue: Promise<void> = Promise.resolve();

  readonly trackPosition$ = this.activeTrack.asObservable().pipe(
    switchMap((track) => track?.position$ ?? of(0)),
    shareReplay({ bufferSize: 1, refCount: false })
  );
  readonly trackState$ = this.activeTrack.asObservable().pipe(
    switchMap((track) => track?.state$ ?? of(PlayingTrackState.NONE)),
    distinctUntilChanged()
  );

  readonly activeTrack$ = this.activeTrack.asObservable().pipe(
    map((howlTrack: HowlTrack | undefined) => {
      if (!howlTrack) return null;
      return howlTrack.track;
    })
  );

  async transitionTo(stateType: Type<TrackTransitionState>): Promise<void> {
    this.transitionQueue = this.transitionQueue.then(() => {
      this.performTransition(stateType);
    });
    return this.transitionQueue;
  }

  private async performTransition(
    stateType: Type<TrackTransitionState>
  ): Promise<void> {
    console.log(`Exiting ${this.currentState.toString()}`);
    await this.currentState.onExit(this);
    this.currentState = this.createState(stateType);
    console.log(`Entering ${this.currentState.toString()}`);
    await this.currentState.onEnter(this);
  }

  async play(track: Track) {
    const trackData = await this.loadSoundService.loadTrack(track);
    const howlTrack = new HowlTrack(trackData, track, this.masterVolume);

    this.transitionQueue = this.transitionQueue.then(() => {
      this.currentState.play(this, howlTrack);
    });
    return this.transitionQueue;
  }

  pause(): void {
    this.activeTrack.getValue()?.pause();
    this.nextTrack.getValue()?.pause();
  }

  resume(): void {
    this.activeTrack.getValue()?.resume();
    this.nextTrack.getValue()?.resume();
  }

  async stop() {
    this.transitionQueue = this.transitionQueue.then(() => {
      this.currentState.stop(this);
    });
    return this.transitionQueue;
  }

  seek(position: number) {
    this.activeTrack.getValue()?.seek(position);
  }

  setVolume(volume: number) {
    this.masterVolume = volume;
    this.activeTrack.getValue()?.setVolume(volume);
    this.nextTrack.getValue()?.setVolume(volume);
  }

  setPullNextTrackFn(pullNextTrackFn: () => Track | undefined): void {
    this.pullNextTrackFn = pullNextTrackFn;
  }

  async getNextFn(): Promise<HowlTrack | undefined> {
    const track = this.pullNextTrackFn();
    if (!track) {
      return undefined;
    }
    console.log('Fetching next track:', track.name);
    const trackData = await this.loadSoundService.loadTrack(track);
    return new HowlTrack(trackData, track, this.masterVolume);
  }

  private createState(stateType: Type<TrackTransitionState>) {
    return runInInjectionContext(this.injector, () => new stateType());
  }
}
