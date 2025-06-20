import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { initialPlaybackState, PlaybackState } from '../models/playback.model';
import { Track } from '@shared/models/track.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private readonly state = new BehaviorSubject<PlaybackState>(
    initialPlaybackState,
  );
  readonly playback$ = this.state.asObservable().pipe(tap(console.log));

  play(track?: Track, queue?: Track[]) {
    const current = this.state.getValue();
    if (queue && track) {
      this.state.next({
        ...current,
        currentTrack: track,
        queue,
        isPlaying: true,
      });
      return;
    }
    if (track) {
      this.state.next({ ...current, currentTrack: track, isPlaying: true });
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
}
