import { BehaviorSubject, Observable } from 'rxjs';
import { PlayingTrackState } from '../models/playback.model';

export class HowlTrack {
  private positionSubject: BehaviorSubject<number> = new BehaviorSubject(0);
  private trackStateSubject: BehaviorSubject<PlayingTrackState> =
    new BehaviorSubject<PlayingTrackState>(PlayingTrackState.NONE);

  private howl: Howl | undefined;
  private readonly currentObjectUrl: string;
  private timerId: number | undefined;

  constructor(
    trackData: Blob,
    private volume: number = 1
  ) {
    this.currentObjectUrl = URL.createObjectURL(trackData);
  }

  dispose() {
    this.stop();
    URL.revokeObjectURL(this.currentObjectUrl);
  }

  get position$(): Observable<number> {
    return this.positionSubject.asObservable();
  }

  get state$(): Observable<PlayingTrackState> {
    return this.trackStateSubject.asObservable();
  }

  seek(position: number): void {
    if (!this.howl) {
      return;
    }
    this.howl.seek(position);
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.howl?.volume(volume);
  }

  async play(): Promise<void> {
    this.stop();

    this.howl = this.createHowl(this.currentObjectUrl);
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
    if (!this.howl) {
      return;
    }
    this.howl.play();
  }

  stop(): void {
    this.stopWatchdog();
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = undefined;
    }
  }

  private createHowl(src: string): Howl {
    const howl = new Howl({
      src: [src],
      html5: true,
      format: 'mp3',
      volume: this.volume,
      preload: true,
    });

    howl.once('load', () => {
      if (!this.howl) return;
      howl.play();
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

  private setupWatchdog() {
    this.stopWatchdog();
    this.timerId = setInterval(() => {
      const howl = this.howl;
      if (howl && howl.playing()) {
        this.positionSubject.next(howl.seek());
      }
    }, 250) as unknown as number;
  }

  private stopWatchdog() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
