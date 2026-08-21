import {
  animationFrames,
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  Subscription,
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
  private readonly currentObjectUrl: string;
  private timerId: number | undefined;

  constructor(
    trackData: Blob,
    readonly track: Track,
    initialVolume: number = 1
  ) {
    this.currentObjectUrl = URL.createObjectURL(trackData);
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
    URL.revokeObjectURL(this.currentObjectUrl);
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

    this.fadeSubscription = animationFrames()
      .pipe(
        map(({ elapsed }) => elapsed / durationMs),
        takeWhile((progress) => progress < 1, true),
        map((progress) => Math.min(1, Math.max(0, progress))),
        map((progress) => startFactor + (endFactor - startFactor) * progress)
      )
      .subscribe({
        next: (factor) => {
          this.fadeFactorSubject.next(factor);
        },
        complete: () => {
          this.fadeFactorSubject.next(endFactor);
          completionSubject.next();
          completionSubject.complete();
        },
      });

    return completionSubject.asObservable();
  }

  load(): void {
    this.howl = this.createHowl(this.currentObjectUrl, false);
  }

  seek(position: number): void {
    if (!this.howl) {
      return;
    }
    this.howl.seek(position);
  }

  async play(): Promise<void> {
    this.stop();

    if (!this.howl) {
      this.howl = this.createHowl(this.currentObjectUrl);
    }

    if (this.howl.state() === 'loaded') {
      this.howl.play();
    } else {
      this.howl.load();
    }
  }

  pause(): void {
    this.stopWatchdog();
    if (!this.howl) {
      return;
    }
    this.howl.pause();
  }

  resume(): void {
    if (!this.howl || this.howl.seek() === 0) {
      return;
    }
    this.howl.play();
  }

  stop(): void {
    this.stopWatchdog();
    this.fadeSubscription?.unsubscribe();
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

  private createHowl(src: string, playOnceLoaded: boolean = true): Howl {
    const howl = new Howl({
      src: [src],
      html5: true,
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
    }
  }
}
