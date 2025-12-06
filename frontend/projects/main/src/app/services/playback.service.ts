import { effect, inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  initialPlaybackState,
  PlaybackState,
  PlayingTrackState,
  RepeatState,
} from '../models/playback.model';
import { StoredPlayback, Track } from '@shared/models/track.model';
import { AudioPlayerService } from './audio-player.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioApiWindow } from '../models/window-api.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService implements OnDestroy {
  private readonly window = <AudioApiWindow>window;
  readonly audioPlayerService = inject(AudioPlayerService);

  private readonly state = new BehaviorSubject<PlaybackState>(
    initialPlaybackState,
  );
  readonly playback$: Observable<PlaybackState> = this.state.asObservable();

  readonly playerPosition = toSignal(this.audioPlayerService.position$, {
    initialValue: 0,
  });
  private readonly PLAY_PREV_DURATION_BREAKPOINT_SEC = 5;
  private readonly trackStateSubscription: Subscription;

  constructor() {
    effect(() => {
      const currentPosition = this.playerPosition();
      const current = this.state.getValue();
      this.state.next({ ...current, position: currentPosition });
    });
    this.trackStateSubscription = this.audioPlayerService.state$.subscribe(
      (state) => this.handleTrackStateChange(state),
    );
    this.loadInitState();
  }

  ngOnDestroy() {
    this.trackStateSubscription.unsubscribe();
  }

  loadInitState() {
    this.window.PLAYBACK_API.loadState().then((state) => {
      this.changeVolume(state.volume);
    });
  }

  async play(track?: Track, queue?: Track[], playlistId?: string) {
    const current = this.state.getValue();
    if (queue && track) {
      this.state.next({
        ...current,
        history: [],
        currentTrack: track,
        queue,
        isPlaying: true,
        duration: track.duration,
        playlistId,
        position: 0,
      });
      await this.audioPlayerService.play(track);
      return;
    }
    if (track) {
      this.state.next({
        ...current,
        currentTrack: track,
        isPlaying: true,
        duration: track.duration,
        position: 0,
      });
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
    const nextState = { ...current, position: 0 };
    if (current.currentTrack) {
      nextState.history.push(current.currentTrack);
    }

    if (current.queue.length > 0) {
      nextState.currentTrack = current.queue[0];
      nextState.queue = current.queue.slice(1);
    } else {
      if (current.repeat === RepeatState.ALL) {
        const newQueue = [...nextState.history];
        nextState.history = [];
        nextState.currentTrack = newQueue[0];
        nextState.queue = newQueue.slice(1);
      } else {
        // TO-DO: Clear currently played song and stop playing.
        this.pause();
        return;
      }
    }
    nextState.duration = nextState.currentTrack.duration;
    nextState.position = 0;
    nextState.isPlaying = true;
    await this.audioPlayerService.play(nextState.currentTrack);
    this.state.next(nextState);
  }

  async playPrev(): Promise<void> {
    const current = this.state.getValue();
    if (!current.currentTrack) {
      return;
    }
    if (current.position > this.PLAY_PREV_DURATION_BREAKPOINT_SEC) {
      this.seek(0);
      return;
    }

    if (current.history.length > 0) {
      const prevTrack = current.history.pop()!;
      current.queue.unshift(current.currentTrack);
      this.state.next({
        ...current,
        currentTrack: prevTrack,
        position: 0,
        isPlaying: true,
      });
      await this.audioPlayerService.play(prevTrack);
    }
  }

  seek(newPos: number) {
    if (newPos > this.state.getValue().duration || newPos < 0) {
      const current = this.state.getValue();
      this.state.next({ ...current, position: 0 });
      return;
    }
    const current = this.state.getValue();
    this.state.next({ ...current, position: newPos });
    this.audioPlayerService.seek(newPos);
  }

  changeVolume(volume: number) {
    const volumeNormalized = Math.max(0, Math.min(volume, 1));
    const current = this.state.getValue();
    const newState = {
      ...current,
      volume: volumeNormalized,
    };
    const isMuted = volumeNormalized === 0;
    this.audioPlayerService.setVolume(volume);
    this.state.next(newState);
    this.updateStoredState(newState);
    this.window.PLAYBACK_API.updateCaptureSettings(isMuted);
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
    this.state.next({
      ...current,
      repeat: nextRepeat,
    });
  }

  private updateStoredState(state: PlaybackState): void {
    this.window.PLAYBACK_API.updateState(this.getStoredStateFromState(state));
  }

  private getStoredStateFromState(state: PlaybackState): StoredPlayback {
    return {
      volume: state.volume,
    };
  }

  private async handleTrackStateChange(
    trackState: PlayingTrackState,
  ): Promise<void> {
    switch (trackState) {
      case PlayingTrackState.ENDED:
        await this.handleTrackEnded();
        break;
    }
  }

  private async handleTrackEnded() {
    if (this.state.getValue().repeat === RepeatState.SINGLE) {
      this.seek(0);
      await this.play();
      return;
    }
    await this.playNext();
  }
}
