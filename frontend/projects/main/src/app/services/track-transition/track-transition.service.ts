import {
  inject,
  Injector,
  runInInjectionContext,
  Service,
  Type,
} from '@angular/core';
import { HowlTrack } from '../../utils/howl-track';
import {
  TrackTransitionState,
  TrackTransitionStateContext,
} from '../../models/track-transition.model';
import { IdleState } from './states/idle-state';
import { StoredTransitionSettings, Track } from '@shared/models/track.model';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { PlayingTrackState } from '../../models/playback.model';
import { PlaybackSettingsApiService } from '@general/services/playback-settings-api.service';

@Service()
export class TrackTransitionService implements TrackTransitionStateContext {
  private readonly injector = inject(Injector);
  private readonly playbackSettingsService = inject(PlaybackSettingsApiService);

  masterVolume: number = 1;
  get fadeInDuration(): number {
    return this.transitionSettings.getValue().fadeInDuration * 1000;
  }
  get crossFadeDuration(): number {
    return this.transitionSettings.getValue().crossFadeDuration * 1000;
  }
  fadeDuration: number = 7.5;
  pullNextTrackFn: () => Track | undefined = () => undefined;
  readonly activeTrack = new BehaviorSubject<HowlTrack | undefined>(undefined);
  readonly nextTrack = new BehaviorSubject<HowlTrack | undefined>(undefined);
  readonly transitionSettings = new BehaviorSubject<StoredTransitionSettings>({
    fadeInDuration: 1,
    crossFadeDuration: 1,
  });

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

  constructor() {
    this.playbackSettingsService
      .loadTransitionSettings()
      .subscribe((settings) => {
        this.transitionSettings.next(settings);
      });

    this.playbackSettingsService.transitionSettings$.subscribe((settings) => {
      this.transitionSettings.next(settings);
    });
  }

  async transitionTo(stateType: Type<TrackTransitionState>): Promise<void> {
    this.transitionQueue = this.transitionQueue.then(() => {
      return this.performTransition(stateType);
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
    const howlTrack = new HowlTrack(track, this.masterVolume);

    this.transitionQueue = this.transitionQueue.then(() => {
      this.currentState.play(this, howlTrack);
    });
    return this.transitionQueue;
  }

  pause(): void {
    if (this.currentState.pause) {
      this.currentState.pause(this);
      return;
    }
    this.activeTrack.getValue()?.pause();
    this.nextTrack.getValue()?.pause();
  }

  resume(): void {
    if (this.currentState.resume) {
      this.currentState.resume(this);
      return;
    }
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
    return new HowlTrack(track, this.masterVolume);
  }

  private createState(stateType: Type<TrackTransitionState>) {
    return runInInjectionContext(this.injector, () => new stateType());
  }
}
