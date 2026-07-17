import { inject, Injectable, signal } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayingTrackState } from '../models/playback.model';
import { Howl } from 'howler';
import { LRUCache } from '@general/utils/lru-cache';
import { LoadSoundService } from './load-sound.service';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private readonly loadSoundService = inject(LoadSoundService);

  private howl?: Howl;
  private positionSubject = new BehaviorSubject<number>(0);
  private timerId?: number;
  private trackStateSubject = new BehaviorSubject<PlayingTrackState>(
    PlayingTrackState.NONE
  );
  private volume = signal<number>(1);
  private playIdRef = 0;
  private currentObjectUrl: string | undefined = undefined;

  private trackDataCache = new LRUCache<string, Blob>(20);

  get position$(): Observable<number> {
    return this.positionSubject.asObservable();
  }

  get state$(): Observable<PlayingTrackState> {
    return this.trackStateSubject.asObservable();
  }

  async play(track: Track) {
    const id = ++this.playIdRef;
    this.stop();
    const trackData = await this.getTrackData(track);
    // Prevents race condition while track is loading and another `play` is called
    if (id !== this.playIdRef) {
      return;
    }
    this.currentObjectUrl = URL.createObjectURL(trackData);
    this.howl = this.createHowl(this.currentObjectUrl);
    if (this.howl.state() === 'loaded') {
      this.howl.play();
    } else {
      // Onload handler starts the audio playing automatically
      this.howl.load();
    }
  }

  pause() {
    this.stopWatchdog();
    if (!this.howl) {
      return;
    }
    this.howl.pause();
  }

  resume() {
    if (!this.howl) {
      return;
    }
    this.howl.play();
  }

  stop() {
    this.stopWatchdog();
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = undefined;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = undefined;
    }
  }

  seek(position: number) {
    if (!this.howl) {
      return;
    }
    this.howl.seek(position);
  }

  setVolume(volume: number): void {
    this.volume.set(volume);
    this.howl?.volume(volume);
  }

  private createHowl(src: string): Howl {
    const howl = new Howl({
      src: [src],
      html5: true,
      format: 'mp3',
      volume: this.volume(),
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

  private async getTrackData(track: Track): Promise<Blob> {
    const cacheData = this.trackDataCache.get(track.id);
    if (cacheData) {
      return cacheData;
    }
    const data = await this.loadTrack(track);
    this.trackDataCache.put(track.id, data);
    return data;
  }

  private async loadTrack(track: Track): Promise<Blob> {
    return this.loadSoundService.loadTrack(track);
  }
}
