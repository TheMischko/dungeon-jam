import {
  animationFrames,
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  take,
  takeWhile,
} from 'rxjs';
import { PlayingTrackState } from '../models/playback.model';
import { Track } from '@shared/models/track.model';

export class HowlTrack {
  private positionSubject = new BehaviorSubject<number>(0);
  private trackStateSubject = new BehaviorSubject<PlayingTrackState>(
    PlayingTrackState.NONE
  );

  private fadeFactorSubject = new BehaviorSubject<number>(1);
  private trackVolumeSubject: BehaviorSubject<number>;

  private volumeSubscription: Subscription;
  private fadeSubscription?: Subscription;

  private howl: Howl | undefined;
  private readonly trackFileURI: string;
  private timerId: number | undefined;

  private isFading: boolean = false;
  private pausedTime: number | undefined;
  private pausedTimeAccumulated: number = 0;

  constructor(
    readonly track: Track,
    initialVolume: number = 1
  ) {
    this.trackFileURI = this.buildTrackFileURI(track);
    this.trackVolumeSubject = new BehaviorSubject<number>(initialVolume);

    this.volumeSubscription = combineLatest([
      this.fadeFactorSubject,
      this.trackVolumeSubject,
    ]).subscribe(([fadeFactor, masterVolume]) => {
      const calculatedVolume = Math.max(
        0,
        Math.min(1, fadeFactor * masterVolume)
      );
      this.howl?.volume(calculatedVolume);
    });
  }

  dispose(): void {
    this.stop();
    this.fadeSubscription?.unsubscribe();
    this.volumeSubscription.unsubscribe();
  }

  get position$(): Observable<number> {
    return this.positionSubject.asObservable();
  }

  get state$(): Observable<PlayingTrackState> {
    return this.trackStateSubject.asObservable();
  }

  setVolume(volume: number): void {
    this.trackVolumeSubject.next(volume);
  }

  /**
   * Sets the relative fade multiplier (0.0 to 1.0) immediately.
   */
  setFadeFactor(factor: number): void {
    this.fadeSubscription?.unsubscribe();
    this.fadeFactorSubject.next(Math.max(0, Math.min(1, factor)));
  }

  /**
   * Performs a smooth reactive fade from startFactor to endFactor over durationMs.
   * Returns an Observable that completes when the fade is finished.
   */
  fade(
    startFactor: number,
    endFactor: number,
    durationMs: number
  ): Observable<void> {
    this.fadeSubscription?.unsubscribe();

    if (durationMs <= 0) {
      this.setFadeFactor(endFactor);
      return of(void 0);
    }

    const completionSubject = new Subject<void>();
    this.isFading = true;

    this.fadeSubscription = animationFrames()
      .pipe(
        map(({ elapsed }) => {
          const effectiveElapsed = this.getEffectiveElapsedTime(elapsed);
          return Math.min(1, Math.max(0, effectiveElapsed / durationMs));
        }),
        takeWhile((progress) => progress < 1, true),
        map((progress) =>
          this.getEqualPowerFadeProgress(progress, startFactor, endFactor)
        )
      )
      .subscribe({
        next: (factor) => {
          if (this.trackStateSubject.getValue() === PlayingTrackState.PAUSED) {
            return;
          }
          this.fadeFactorSubject.next(factor);
        },
        complete: () => {
          this.fadeFactorSubject.next(endFactor);
          completionSubject.next();
          completionSubject.complete();
          this.isFading = false;
          this.pausedTimeAccumulated = 0;
          this.pausedTime = undefined;
        },
      });

    return completionSubject.asObservable().pipe(take(1));
  }

  load(): void {
    if (this.howl) {
      return;
    }
    this.howl = this.createHowl(this.trackFileURI, false);
  }

  seek(position: number): void {
    if (!this.howl) {
      return;
    }
    this.howl.seek(position);
  }

  async play(): Promise<void> {
    if (!this.howl) {
      this.howl = this.createHowl(this.trackFileURI);
    }

    if (this.howl.state() === 'loaded') {
      this.howl.play();
    } else {
      this.howl.once('load', () => this.howl?.play());
      this.howl.load();
    }
  }

  pause(): void {
    this.stopWatchdog();
    if (!this.howl) {
      return;
    }
    this.howl.pause();
    this.trackStateSubject.next(PlayingTrackState.PAUSED);
    this.pausedTime = Date.now();
  }

  resume(): void {
    if (!this.howl) {
      return;
    }
    this.setupWatchdog();
    this.howl.play();
    this.trackStateSubject.next(PlayingTrackState.PLAYING);
    if (this.isFading && this.pausedTime) {
      const currentDelta = Date.now() - this.pausedTime;
      this.pausedTimeAccumulated += currentDelta;
      this.pausedTime = undefined;
    }
  }

  stop(): void {
    this.stopWatchdog();
    this.fadeSubscription?.unsubscribe();
    this.trackStateSubject.next(PlayingTrackState.NONE);
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = undefined;
    }
  }

  private getEffectiveVolume(): number {
    return Math.max(
      0,
      Math.min(
        1,
        this.fadeFactorSubject.getValue() * this.trackVolumeSubject.getValue()
      )
    );
  }

  private HTML5_THRESHOLD = 360;
  private createHowl(src: string, playOnceLoaded: boolean = true): Howl {
    const html5 = this.track.duration >= this.HTML5_THRESHOLD;
    const howl = new Howl({
      src: [src],
      html5,
      format: 'mp3',
      volume: this.getEffectiveVolume(),
      preload: true,
    });

    howl.once('load', () => {
      if (!this.howl) return;
      if (playOnceLoaded) {
        howl.play();
      }
    });
    howl.on('play', () => {
      if (this.howl) {
        this.trackStateSubject.next(PlayingTrackState.PLAYING);
        const position = this.howl.seek();
        this.positionSubject.next(position);
        this.setupWatchdog();
      }
    });
    howl.on('end', () => {
      this.trackStateSubject.next(PlayingTrackState.ENDED);
    });

    return howl;
  }

  private buildTrackFileURI(track: Track): string {
    return `media://tracks/${encodeURIComponent(track.id)}`;
  }

  private setupWatchdog(): void {
    this.stopWatchdog();
    this.timerId = setInterval(() => {
      const howl = this.howl;
      if (howl && howl.playing()) {
        this.positionSubject.next(howl.seek());
      }
    }, 250) as unknown as number;
  }

  private stopWatchdog(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private getEqualPowerFadeProgress(
    progress: number,
    startFactor: number,
    endFactor: number
  ): number {
    let curvedProgress: number;
    if (startFactor < endFactor) {
      curvedProgress = Math.sin((progress * Math.PI) / 2);
    } else {
      curvedProgress = 1 - Math.cos((progress * Math.PI) / 2);
    }
    return startFactor + (endFactor - startFactor) * curvedProgress;
  }

  private getEffectiveElapsedTime(elapsed: number) {
    const currentDelta = this.pausedTime ? Date.now() - this.pausedTime : 0;
    return elapsed - currentDelta - this.pausedTimeAccumulated;
  }
}
