import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initialPlaybackState, PlaybackState } from '../models/playback.model';
import { Track } from '@shared/models/track.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private readonly state = new BehaviorSubject<PlaybackState>(
    initialPlaybackState,
  );
  readonly playback$: Observable<PlaybackState> = this.state.asObservable();

  play(track?: Track, queue?: Track[]) {
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
      return;
    }

    this.state.next({ ...current, isPlaying: true });
  }

  pause() {
    const current = this.state.getValue();
    this.state.next({ ...current, isPlaying: false });
  }

  next() {
    const current = this.state.getValue();
    const nextState = { ...current, position: 0 };
    if (current.queue.length > 0) {
      if (current.currentTrack) {
        nextState.history.push(current.currentTrack);
      }
      nextState.currentTrack = current.queue[0];
      nextState.queue = current.queue.slice(1);
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
  }
}
