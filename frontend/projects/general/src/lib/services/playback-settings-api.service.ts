import { Injectable } from '@angular/core';
import { PlaybackApiWindow } from '../../../models/api/playback-api.model';
import { Observable, Subject } from 'rxjs';
import {
  StoredPlayback,
  StoredTransitionSettings,
} from '@shared/models/track.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackSettingsApiService {
  private readonly window: PlaybackApiWindow = window as PlaybackApiWindow;
  private readonly transitionSettingsSubject =
    new Subject<StoredTransitionSettings>();

  get transitionSettings$(): Observable<StoredTransitionSettings> {
    return this.transitionSettingsSubject.asObservable();
  }

  constructor() {
    this.window.PLAYBACK_API?.onTransitionChanged?.(
      (settings: StoredTransitionSettings) => {
        this.transitionSettingsSubject.next(settings);
      }
    );
  }

  loadState(): Observable<StoredPlayback> {
    const subject = new Subject<StoredPlayback>();
    this.window.PLAYBACK_API.loadState()
      .then((state) => {
        subject.next(state);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  updateState(newState: StoredPlayback): void {
    this.window.PLAYBACK_API.updateState(newState);
  }

  updateCaptureSettings(isLocalMuted: boolean): void {
    this.window.PLAYBACK_API.updateCaptureSettings(isLocalMuted);
  }

  loadTransitionSettings(): Observable<StoredTransitionSettings> {
    const subject = new Subject<StoredTransitionSettings>();
    this.window.PLAYBACK_API.loadTransitionSettings()
      .then((settings) => {
        subject.next(settings);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });
    return subject.asObservable();
  }

  updateTransitionSettings(newState: StoredTransitionSettings): void {
    this.window.PLAYBACK_API.updateTransitionSettings(newState);
  }

  onTransitionChanged(
    callback: (settings: StoredTransitionSettings) => void | Promise<void>
  ): void {
    this.window.PLAYBACK_API.onTransitionChanged(callback);
  }
}
