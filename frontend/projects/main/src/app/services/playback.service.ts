import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  pairwise,
  startWith,
} from 'rxjs';
import {
  PlaybackState,
  PlaybackTrackPosition,
  PlayingTrackState,
  PlayMetadata,
} from '../models/playback.model';
import { RepeatState, StoredPlayback, Track } from '@shared/models/track.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudioApiWindow } from '../models/window-api.model';
import { TrackTransitionService } from './track-transition/track-transition.service';
import { QueueManager } from './track-transition/queue.manager';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  readonly trackTransitionService = inject(TrackTransitionService);
  readonly queueManager = inject(QueueManager);
  readonly destroyRef = inject(DestroyRef);
  private readonly window = <AudioApiWindow>window;

  private readonly PLAY_PREV_POSITON_THRESHOLD_SEC = 15;
  private initialized: boolean = false;

  private readonly volume = new BehaviorSubject<number>(1);
  get volume$() {
    return this.volume.asObservable();
  }
  private readonly metadata = new BehaviorSubject<PlayMetadata>({});

  readonly playback$ = combineLatest([
    this.queueManager.queue$,
    this.trackTransitionService.activeTrack$,
    this.trackTransitionService.trackState$,
    this.queueManager.shuffle$,
    this.queueManager.repeatState$,
    this.volume$,
    this.metadata.asObservable(),
    this.queueManager.currentTrackIsInjected$,
  ]).pipe(
    map((values) => {
      const [
        queue,
        activeTrack,
        activeTrackState,
        shuffle,
        repeatMode,
        volume,
        metadata,
        isInjected,
      ] = values;
      return {
        queue,
        currentTrack: activeTrack,
        currentTrackIsInjected: isInjected,
        isPlaying: activeTrackState === PlayingTrackState.PLAYING,
        shuffle,
        repeat: repeatMode,
        volume,
        playlistId: metadata.playlistId,
        sceneId: metadata.sceneId,
        sessionId: metadata.sessionId,
      } as PlaybackState;
    })
  );

  readonly position$ = combineLatest([
    this.trackTransitionService.activeTrack$,
    this.trackTransitionService.trackPosition$,
  ]).pipe(
    map((values) => {
      const [track, position] = values;
      return {
        position,
        duration: track?.duration ?? position,
      } as PlaybackTrackPosition;
    })
  );

  readonly currentTrackId$ = this.playback$.pipe(
    map((state) => state.currentTrack?.id ?? undefined)
  );

  constructor() {
    this.window.PLAYBACK_API.loadState().then((state) => {
      this.changeVolume(state.volume);
      this.shuffle(state.shuffle);
      this.setRepeat(state.repeat);
      this.initialized = true;
    });

    this.trackTransitionService.setPullNextTrackFn(() => {
      return this.queueManager.peekNext();
    });

    this.trackTransitionService.activeTrack$
      .pipe(takeUntilDestroyed(this.destroyRef), startWith(null), pairwise())
      .subscribe(([prevTrack, activeTrack]) => {
        if (!activeTrack) {
          return;
        }
        const queueItem = this.queueManager.peekNext();

        if (queueItem && queueItem.id === activeTrack.id) {
          this.queueManager.advanceNext(prevTrack ?? undefined);
        }
      });

    this.playback$
      .pipe(takeUntilDestroyed(this.destroyRef), startWith(null), pairwise())
      .subscribe(([prevState, currentState]) => {
        if (!this.initialized) {
          return;
        }
        if (!prevState || !currentState) {
          return;
        }
        const repeatChanged = prevState.repeat !== currentState.repeat;
        const volumeChanged = prevState.volume !== currentState.volume;
        const shuffleChanged = prevState.shuffle !== currentState.shuffle;

        if (repeatChanged || volumeChanged || shuffleChanged) {
          this.updateStoredState(currentState);
        }
      });
  }

  async clearState() {
    this.queueManager.reset();
    this.metadata.next({});
    await this.trackTransitionService.stop();
  }

  async play(
    track?: Track,
    queue?: Track[],
    metadata?: PlayMetadata
  ): Promise<void> {
    if (!track) {
      this.trackTransitionService.resume();
      return;
    }

    if (queue) {
      this.queueManager.setQueue([track, ...queue]);
    }

    this.metadata.next(metadata ?? {});

    await this.trackTransitionService.play(track);
  }

  async playTracks(trackList: Track[], metadata?: PlayMetadata): Promise<void> {
    if (trackList.length === 0) {
      return;
    }
    const firstTrack = this.queueManager.setQueue(trackList);

    if (firstTrack) {
      await this.trackTransitionService.play(firstTrack);
      this.metadata.next(metadata ?? {});
    }
  }

  async playNext(): Promise<void> {
    const currentState = await firstValueFrom(this.playback$);
    const nextTrack = this.queueManager.advanceNext(
      !currentState.currentTrackIsInjected
        ? (currentState.currentTrack ?? undefined)
        : undefined
    );
    if (nextTrack) {
      await this.trackTransitionService.play(nextTrack);
    }
  }

  async playPrev(): Promise<void> {
    const currentPosition = await firstValueFrom(this.position$);
    if (currentPosition.position >= this.PLAY_PREV_POSITON_THRESHOLD_SEC) {
      return this.trackTransitionService.seek(0);
    }

    const prevTrack = this.queueManager.advancePrev();
    if (prevTrack) {
      await this.trackTransitionService.play(prevTrack);
    }
  }

  injectNext(track: Track): void {
    this.queueManager.injectNextTrack(track);
  }

  pause() {
    this.trackTransitionService.pause();
  }

  async togglePlayPause(): Promise<void> {
    const state = await firstValueFrom(this.playback$);
    if (!state.currentTrack) {
      return;
    }
    if (state.isPlaying) {
      return this.trackTransitionService.pause();
    }
    await this.play();
  }

  seek(position: number) {
    this.trackTransitionService.seek(position);
  }

  toggleShuffle() {
    this.queueManager.toggleShuffle();
  }

  shuffle(enabled: boolean) {
    this.queueManager.setShuffle(enabled);
  }

  changeRepeat(): void {
    this.queueManager.toggleRepeatMode();
  }

  setRepeat(repeatState: RepeatState) {
    this.queueManager.setRepeatState(repeatState);
  }

  changeVolume(volume: number) {
    const volumeNormalized = Math.max(0, Math.min(volume, 1));
    this.volume.next(volumeNormalized);
    this.trackTransitionService.setVolume(volumeNormalized);
  }

  private getStoredStateFromState(state: PlaybackState): StoredPlayback {
    return {
      volume: state.volume,
      shuffle: state.shuffle,
      repeat: state.repeat,
    };
  }

  private updateStoredState(state: PlaybackState): void {
    this.window.PLAYBACK_API.updateState(this.getStoredStateFromState(state));
  }
}
