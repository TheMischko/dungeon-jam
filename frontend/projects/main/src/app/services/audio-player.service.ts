import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PlayingTrackState } from '../models/playback.model';
import { LRUCache } from '@general/utils/lru-cache';
import { LoadSoundService } from './load-sound.service';
import { HowlTrack } from '../utils/howl-track';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private readonly loadSoundService = inject(LoadSoundService);
  private readonly destroyRef = inject(DestroyRef);

  private howlTrack: HowlTrack | undefined;

  private trackPositionSubscription: Subscription | undefined;
  private positionSubject = new BehaviorSubject<number>(0);
  private trackStateSubscription: Subscription | undefined;
  private trackStateSubject = new BehaviorSubject<PlayingTrackState>(
    PlayingTrackState.NONE
  );
  private volume = signal<number>(1);
  private playIdRef = 0;

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
    this.howlTrack = new HowlTrack(trackData, this.volume());

    this.trackPositionSubscription?.unsubscribe();
    this.trackPositionSubscription = this.howlTrack.position$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((position) => {
        this.positionSubject.next(position);
      });

    this.trackStateSubscription?.unsubscribe();
    this.trackStateSubscription = this.howlTrack.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.trackStateSubject.next(state);
      });
    await this.howlTrack.play();
  }

  pause() {
    this.howlTrack?.pause();
  }

  resume() {
    this.howlTrack?.resume();
  }

  stop() {
    this.trackPositionSubscription?.unsubscribe();
    this.trackStateSubscription?.unsubscribe();
    this.howlTrack?.stop();
    this.howlTrack?.dispose();
    this.howlTrack = undefined;
    this.positionSubject.next(0);
    this.trackStateSubject.next(PlayingTrackState.NONE);
  }

  seek(position: number) {
    this.howlTrack?.seek(position);
  }

  setVolume(volume: number): void {
    this.volume.set(volume);
    this.howlTrack?.setVolume(volume);
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
