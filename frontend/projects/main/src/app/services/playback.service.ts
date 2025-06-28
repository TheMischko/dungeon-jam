import { effect, inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initialPlaybackState, PlaybackState } from '../models/playback.model';
import { Track } from '@shared/models/track.model';
import { AudioPlayerService } from './audio-player.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  readonly audioPlayerService = inject(AudioPlayerService);
  private readonly state = new BehaviorSubject<PlaybackState>(
    initialPlaybackState,
  );
  readonly playback$: Observable<PlaybackState> = this.state.asObservable();
  readonly playerPosition = toSignal(this.audioPlayerService.position$, {
    initialValue: 0,
  });

  constructor() {
    effect(() => {
      const currentPosition = this.playerPosition();
      const current = this.state.getValue();
      this.state.next({ ...current, position: currentPosition });
    });
  }

  async play(track?: Track, queue?: Track[]) {
    const current = this.state.getValue();
    if (queue && track) {
      this.state.next({
        ...current,
        currentTrack: track,
        queue,
        isPlaying: true,
        duration: track.duration,
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

  async next() {
    const current = this.state.getValue();
    const nextState = { ...current, position: 0 };
    if (current.queue.length > 0) {
      if (current.currentTrack) {
        nextState.history.push(current.currentTrack);
      }
      nextState.currentTrack = current.queue[0];
      nextState.queue = current.queue.slice(1);
      nextState.duration = nextState.currentTrack.duration;
      nextState.position = 0;
      nextState.isPlaying = true;
      await this.audioPlayerService.play(nextState.currentTrack);
    }
    this.state.next(nextState);
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
}
