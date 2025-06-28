import { Injectable } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AudioApiWindow } from '../models/window-api.model';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private readonly window: AudioApiWindow = <AudioApiWindow>window;
  private howl?: Howl;
  private positionSubject = new BehaviorSubject<number>(0);
  private timerId?: number;

  private trackDataCache = new Map<string, Blob>();

  get position$(): Observable<number> {
    return this.positionSubject.asObservable();
  }

  async play(track: Track) {
    this.stop();
    const trackData = await this.getTrackData(track);
    this.howl = new Howl({
      src: [URL.createObjectURL(trackData)],
      html5: true,
    });
    this.howl.on('play', () => {
      if (this.howl) {
        const position = this.howl.seek();
        this.positionSubject.next(position);
        this.setupWatchdog();
      }
    });
    this.howl.play();
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
    if (!this.howl) {
      return;
    }
    this.howl.stop();
    this.howl.unload();
    this.howl = undefined;
  }

  seek(position: number) {
    if (!this.howl) {
      return;
    }
    this.howl.seek(position);
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
    if (!this.trackDataCache.has(track.id)) {
      const data = await this.loadTrack(track);
      this.trackDataCache.set(track.id, data);
    }
    return this.trackDataCache.get(track.id)!;
  }

  private async loadTrack(track: Track): Promise<Blob> {
    const data = await this.window.AUDIO_FILES_API.loadFileBase64(track.url);
    const byteChars = atob(data.base64);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: data.mimeType });
  }
}
