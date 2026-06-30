import { effect, inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import {
  initialPlaybackState,
  PlaybackState,
  PlaybackTrackPosition,
  PlayingTrackState,
  PlayMetadata,
  QueueItem,
} from '../models/playback.model';
import { RepeatState, StoredPlayback, Track } from '@shared/models/track.model';
import { AudioPlayerService } from './audio-player.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioApiWindow } from '../models/window-api.model';
import { shuffleList } from '../utils/shuffle-list';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService implements OnDestroy {
  private readonly window = <AudioApiWindow>window;
  readonly audioPlayerService = inject(AudioPlayerService);

  private readonly state = new BehaviorSubject<PlaybackState>(
    initialPlaybackState
  );
  private readonly trackPosition = new BehaviorSubject<
    PlaybackTrackPosition | undefined
  >(undefined);

  readonly playback$: Observable<PlaybackState> = this.state.asObservable();
  readonly position$: Observable<PlaybackTrackPosition | undefined> =
    this.trackPosition.asObservable();
  readonly currentTrackId$ = this.playback$.pipe(
    map((state) => state.currentTrack?.id ?? null)
  );

  readonly playerPosition = toSignal(this.audioPlayerService.position$, {
    initialValue: 0,
  });
  private readonly PLAY_PREV_DURATION_BREAKPOINT_SEC = 5;
  private readonly trackStateSubscription: Subscription;

  constructor() {
    effect(() => {
      const currentPosition = this.playerPosition();
      const currentState = this.state.getValue();
      const currentTrackPos = this.trackPosition.getValue();
      const duration =
        currentTrackPos?.duration ??
        currentState?.currentTrack?.duration ??
        currentPosition;
      this.trackPosition.next({ position: currentPosition, duration });
    });
    this.trackStateSubscription = this.audioPlayerService.state$.subscribe(
      (state) => this.handleTrackStateChange(state)
    );
    this.loadInitState();
  }

  ngOnDestroy() {
    this.trackStateSubscription.unsubscribe();
  }

  loadInitState() {
    this.window.PLAYBACK_API.loadState().then((state) => {
      this.changeVolume(state.volume, false);
      this.shuffle(state.shuffle, false);
      this.setRepeat(state.repeat);
    });
  }

  /**
   * Adds the tracks to queue and plays either first one or random based on shuffle state.
   * @param trackList
   * @param metadata
   */
  async playTracks(trackList: Track[], metadata?: PlayMetadata) {
    const shuffle = this.state.getValue().shuffle;
    let track: Track;
    let queue: Track[];
    if (shuffle) {
      const startingTrackIndex = Math.ceil(Math.random() * trackList.length);
      track = trackList[startingTrackIndex];
      queue = [
        ...trackList.slice(startingTrackIndex + 1),
        ...trackList.slice(0, startingTrackIndex),
      ];
    } else {
      track = trackList[0];
      queue = trackList.slice(1);
    }
    await this.play(track, queue, metadata);
  }

  async play(track?: Track, queue?: Track[], metadata?: PlayMetadata) {
    const current = this.state.getValue();
    if (queue && track) {
      let newQueue: QueueItem[] = queue.map((t) => ({
        track: t,
        isInjected: false,
      }));
      if (current.shuffle) {
        newQueue = shuffleList(newQueue);
      }
      this.state.next({
        ...current,
        history: [],
        currentTrack: track,
        currentTrackIsInjected: false,
        queue: newQueue,
        isPlaying: true,
        playlistId: metadata?.playlistId,
        sceneId: metadata?.sceneId,
      });
      this.trackPosition.next({ position: 0, duration: track.duration });
      await this.audioPlayerService.play(track);
      return;
    }
    if (track) {
      this.state.next({
        ...current,
        currentTrack: track,
        currentTrackIsInjected: false,
        isPlaying: true,
      });
      this.trackPosition.next({ position: 0, duration: track.duration });
      await this.audioPlayerService.play(track);
      return;
    }

    this.state.next({ ...current, isPlaying: true });
    this.audioPlayerService.resume();
  }

  pause() {
    const current = this.state.getValue();
    this.state.next({ ...current, isPlaying: false });
    this.audioPlayerService.pause();
  }

  async playNext() {
    const current = this.state.getValue();

    const newHistory =
      current.currentTrack && !current.currentTrackIsInjected
        ? [...current.history, current.currentTrack]
        : [...current.history];

    if (current.queue.length > 0) {
      const [next, ...remaining] = current.queue;
      this.state.next({
        ...current,
        history: newHistory,
        currentTrack: next.track,
        currentTrackIsInjected: next.isInjected,
        queue: remaining,
        isPlaying: true,
      });
      await this.audioPlayerService.play(next.track);
      this.trackPosition.next({ position: 0, duration: next.track.duration });
      return;
    }

    if (current.repeat === RepeatState.ALL) {
      const recycled: QueueItem[] = newHistory.map((t) => ({
        track: t,
        isInjected: false,
      }));
      if (recycled.length === 0) {
        this.pause();
        return;
      }
      const next = recycled[0];
      this.state.next({
        ...current,
        history: [],
        currentTrack: next.track,
        currentTrackIsInjected: false,
        queue: recycled.slice(1),
        isPlaying: true,
      });
      await this.audioPlayerService.play(next.track);
      this.trackPosition.next({ position: 0, duration: next.track.duration });
      return;
    }

    this.pause();
  }

  clearState() {
    this.audioPlayerService.pause();
    const current = this.state.getValue();
    this.state.next({
      ...current,
      queue: [],
      history: [],
      isPlaying: false,
      currentTrack: null,
      sceneId: undefined,
      playlistId: undefined,
    });
    this.trackPosition.next({ position: 0, duration: 0 });
  }

  async playPrev(): Promise<void> {
    const current = this.state.getValue();
    const trackPosition = this.trackPosition.getValue();
    if (!current.currentTrack) {
      return;
    }
    if (
      trackPosition?.position &&
      trackPosition.position > this.PLAY_PREV_DURATION_BREAKPOINT_SEC
    ) {
      this.seek(0);
      return;
    }

    if (current.history.length > 0) {
      const prevTrack = current.history[current.history.length - 1];
      const newHistory = current.history.slice(0, -1);
      const newQueue: QueueItem[] = [
        {
          track: current.currentTrack,
          isInjected: current.currentTrackIsInjected,
        },
        ...current.queue,
      ];
      this.state.next({
        ...current,
        currentTrack: prevTrack,
        currentTrackIsInjected: false,
        history: newHistory,
        queue: newQueue,
        isPlaying: true,
      });
      this.trackPosition.next({ position: 0, duration: prevTrack.duration });
      await this.audioPlayerService.play(prevTrack);
    }
  }

  seek(newPos: number) {
    const currentPosition = this.trackPosition.getValue();
    if (!currentPosition) {
      return;
    }
    if (newPos > currentPosition.duration || newPos < 0) {
      this.trackPosition.next({ ...currentPosition, position: 0 });
      return;
    }
    this.trackPosition.next({ ...currentPosition, position: newPos });
    this.audioPlayerService.seek(newPos);
  }

  changeVolume(volume: number, storeUpdate = true) {
    const volumeNormalized = Math.max(0, Math.min(volume, 1));
    const current = this.state.getValue();
    const newState = {
      ...current,
      volume: volumeNormalized,
    };
    const isLocalMuted = volumeNormalized === 0;
    this.audioPlayerService.setVolume(volume);
    this.state.next(newState);
    if (storeUpdate) {
      this.updateStoredState(newState);
    }
    this.window.PLAYBACK_API.updateCaptureSettings(isLocalMuted);
  }

  changeRepeat() {
    const current = this.state.getValue();
    const currentRepeat = current.repeat;
    let nextRepeat: RepeatState;
    switch (true) {
      case currentRepeat === RepeatState.ALL:
        nextRepeat = RepeatState.NONE;
        break;
      case currentRepeat === RepeatState.SINGLE:
        nextRepeat = RepeatState.ALL;
        break;
      default:
        nextRepeat = RepeatState.SINGLE;
        break;
    }
    const newState = {
      ...current,
      repeat: nextRepeat,
    };
    this.state.next(newState);
    this.updateStoredState(newState);
  }

  private setRepeat(repeat: RepeatState): void {
    const currentState = this.state.getValue();
    this.state.next({
      ...currentState,
      repeat,
    });
  }

  shuffle(enabled: boolean, storeUpdate = true) {
    const state = this.state.getValue();

    let queue = [...state.queue];
    if (!state.shuffle && enabled && queue.length > 1) {
      // only the regular portion of queue is reshuffled
      const injected = queue.filter((item) => item.isInjected);
      const regular = queue.filter((item) => !item.isInjected);
      queue = [...injected, ...shuffleList(regular)];
    }

    const newState = { ...state, shuffle: enabled, queue };
    this.state.next(newState);
    if (storeUpdate) {
      this.updateStoredState(newState);
    }
  }

  addToQueue(track: Track, playLast: boolean = false) {
    const state = this.state.getValue();
    const item: QueueItem = { track, isInjected: false };
    const newQueue = playLast ? [...state.queue, item] : [item, ...state.queue];
    this.state.next({ ...state, queue: newQueue });
  }

  injectNext(track: Track) {
    const state = this.state.getValue();
    const item: QueueItem = { track, isInjected: true };
    this.state.next({ ...state, queue: [item, ...state.queue] });
  }

  private updateStoredState(state: PlaybackState): void {
    this.window.PLAYBACK_API.updateState(this.getStoredStateFromState(state));
  }

  private getStoredStateFromState(state: PlaybackState): StoredPlayback {
    return {
      volume: state.volume,
      shuffle: state.shuffle,
      repeat: state.repeat,
    };
  }

  private async handleTrackStateChange(
    trackState: PlayingTrackState
  ): Promise<void> {
    switch (trackState) {
      case PlayingTrackState.ENDED:
        await this.handleTrackEnded();
        break;
    }
  }

  private async handleTrackEnded() {
    if (this.state.getValue().repeat === RepeatState.SINGLE) {
      await this.play();
      this.seek(0);
      return;
    }
    await this.playNext();
  }
}
