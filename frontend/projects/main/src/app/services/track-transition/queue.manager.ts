import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  skip,
} from 'rxjs';
import { RepeatState, Track } from '@shared/models/track.model';
import { QueueItem } from '../../models/playback.model';
import { shuffleList } from '../../utils/shuffle-list';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class QueueManager {
  private readonly destroyRef = inject(DestroyRef);

  private readonly trackList = new BehaviorSubject<Track[]>([]);
  private readonly queue = new BehaviorSubject<Track[]>([]);
  private readonly playNext = new BehaviorSubject<Track[]>([]);
  private readonly history = new BehaviorSubject<Track[]>([]);
  private readonly currentIndex = new BehaviorSubject<number | undefined>(
    undefined
  );

  private readonly isCurrentTrackInjected = new BehaviorSubject<boolean>(false);
  get currentTrackIsInjected$() {
    return this.isCurrentTrackInjected.asObservable();
  }
  private readonly shuffle = new BehaviorSubject<boolean>(false);
  get shuffle$() {
    return this.shuffle.asObservable();
  }
  private readonly repeatState = new BehaviorSubject<RepeatState>(
    RepeatState.NONE
  );
  get repeatState$() {
    return this.repeatState.asObservable();
  }

  constructor() {
    this.shuffle$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        skip(1)
      )
      .subscribe((shuffle) => {
        const trackList = this.trackList.getValue();
        if (trackList.length === 0) {
          return;
        }

        const oldQueue = this.queue.getValue();
        const currentIndex = this.currentIndex.getValue();
        const currentTrack =
          currentIndex !== undefined ? oldQueue[currentIndex] : undefined;

        if (shuffle) {
          if (currentTrack) {
            const otherTracks = trackList.filter(
              (t) => t.id !== currentTrack.id
            );
            this.queue.next([currentTrack, ...shuffleList(otherTracks)]);
            this.currentIndex.next(0);
          } else {
            this.queue.next(shuffleList(trackList));
          }
        } else {
          this.queue.next(trackList);
          if (currentTrack) {
            const newIndex = trackList.findIndex(
              (track) => track.id === currentTrack.id
            );
            this.currentIndex.next(newIndex >= 0 ? newIndex : 0);
          }
        }
      });
  }

  get queue$(): Observable<QueueItem[]> {
    return combineLatest([
      this.queue.asObservable(),
      this.playNext.asObservable(),
      this.currentIndex.asObservable(),
    ]).pipe(
      map((values) => {
        const [queue, playNext, currentIndex] = values;
        const upcomingStart = currentIndex !== undefined ? currentIndex + 1 : 0;

        return [
          ...playNext.map((track) => this.mapToQueueItem(track, true)),
          ...queue
            .slice(upcomingStart)
            .map((track) => this.mapToQueueItem(track, false)),
        ];
      })
    );
  }

  private get currentShuffle() {
    return this.shuffle.getValue();
  }
  private get currentQueue() {
    return this.queue.getValue();
  }

  reset() {
    this.playNext.next([]);
    this.history.next([]);
    this.currentIndex.next(undefined);
    this.isCurrentTrackInjected.next(false);
  }

  setQueue(tracks: Track[], targetTrackId?: string): Track | undefined {
    this.playNext.next([]);
    this.history.next([]);
    this.isCurrentTrackInjected.next(false);
    this.trackList.next(tracks);

    if (tracks.length === 0) {
      this.queue.next([]);
      this.currentIndex.next(undefined);
      return undefined;
    }

    const isShuffle = this.shuffle.getValue();

    if (targetTrackId) {
      const targetTrack =
        tracks.find((t) => t.id === targetTrackId) ?? tracks[0];
      const otherTracks = tracks.filter((t) => t.id !== targetTrack.id);
      const newQueue = isShuffle
        ? [targetTrack, ...shuffleList(otherTracks)]
        : [...tracks];
      this.queue.next(newQueue);
      const targetIndex = newQueue.findIndex((t) => t.id === targetTrack.id);
      this.currentIndex.next(targetIndex >= 0 ? targetIndex : 0);
      return targetTrack;
    } else {
      const newQueue = isShuffle ? shuffleList(tracks) : [...tracks];
      this.queue.next(newQueue);
      this.currentIndex.next(0);
      return newQueue[0];
    }
  }

  injectNextTrack(track: Track) {
    this.playNext.next([...this.playNext.getValue(), track]);
  }

  peekNext(): Track | undefined {
    if (!this.injectedTracksEmpty()) {
      return this.playNext.getValue()[0];
    }
    const nextIndex = this.getNextIndex();
    if (nextIndex === undefined) {
      return undefined;
    }
    return this.queue.getValue()[nextIndex];
  }

  advanceNext(currentTrack?: Track): Track | undefined {
    if (
      currentTrack &&
      this.repeatState.getValue() !== RepeatState.SINGLE &&
      !this.isCurrentTrackInjected.getValue()
    ) {
      this.addToHistory(currentTrack);
    }
    if (!this.injectedTracksEmpty()) {
      const injectedTracks = this.playNext.getValue();
      const nextInjected = injectedTracks[0];
      this.playNext.next(injectedTracks.slice(1));
      this.isCurrentTrackInjected.next(true);
      return nextInjected;
    }
    const nextIndex = this.getNextIndex();
    if (nextIndex === undefined) {
      return undefined;
    }
    this.currentIndex.next(nextIndex);
    this.isCurrentTrackInjected.next(false);
    return this.queue.getValue()[nextIndex];
  }

  advancePrev(): Track | undefined {
    const history = this.history.getValue();
    const queue = this.queue.getValue();

    if (history.length === 0) {
      if (this.repeatState.getValue() === RepeatState.ALL) {
        if (queue.length > 0) {
          this.currentIndex.next(queue.length - 1);
          return queue[queue.length - 1];
        }
      }
      return undefined;
    }

    const recentTrack = this.popFromHistory()!;
    this.isCurrentTrackInjected.next(false);

    const prevIndex = queue.findIndex((track) => track.id === recentTrack.id);
    if (prevIndex >= 0) {
      this.currentIndex.next(prevIndex);
    }

    return recentTrack;
  }

  toggleShuffle() {
    this.shuffle.next(!this.currentShuffle);
  }

  setShuffle(value: boolean) {
    this.shuffle.next(value);
  }

  setRepeatState(state: RepeatState) {
    this.repeatState.next(state);
  }

  toggleRepeatMode() {
    const currentRepeat = this.repeatState.getValue();
    switch (currentRepeat) {
      case RepeatState.NONE: {
        return this.repeatState.next(RepeatState.SINGLE);
      }
      case RepeatState.SINGLE: {
        return this.repeatState.next(RepeatState.ALL);
      }
      default: {
        return this.repeatState.next(RepeatState.NONE);
      }
    }
  }

  private mapToQueueItem(track: Track, isInjected: boolean): QueueItem {
    return {
      track,
      isInjected,
    };
  }

  private getNextIndex(): number | undefined {
    const currentQueue = this.queue.getValue();
    if (currentQueue.length === 0) {
      return undefined;
    }

    const currentIndex = this.currentIndex.getValue();
    if (currentIndex === undefined || currentIndex < 0) {
      return 0;
    }

    if (this.repeatState.getValue() === RepeatState.SINGLE) {
      return currentIndex;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= currentQueue.length) {
      if (this.repeatState.getValue() === RepeatState.ALL) {
        return 0;
      }
      return undefined;
    }
    return nextIndex;
  }

  private injectedTracksEmpty(): boolean {
    return this.playNext.getValue().length === 0;
  }

  private addToHistory(track: Track) {
    this.history.next([...this.history.getValue(), track]);
  }

  private popFromHistory(): Track | undefined {
    const currentHistory = this.history.getValue();
    if (currentHistory.length === 0) {
      return undefined;
    }
    this.history.next(currentHistory.slice(0, -1));
    return currentHistory[currentHistory.length - 1];
  }
}
