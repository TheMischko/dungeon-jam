import { Injectable } from '@angular/core';
import { AudioTrack } from '@shared/models/track.model';
import { Observable, Subject } from 'rxjs';
import { AudioApiWindow } from '../models/window-api.model';

@Injectable({
  providedIn: 'root',
})
export class AudioFilesService {
  private readonly window = <AudioApiWindow>window;
  constructor() {}

  registerAudioDrop(callback: (paths: AudioTrack[]) => void): void {
    this.window.AUDIO_FILES_API.registerAudioFileDrop((paths) =>
      callback(paths)
    );
  }

  uploadAudioTracks(tracks: AudioTrack[]): Observable<void> {
    const subject = new Subject<void>();

    this.window.AUDIO_FILES_API.uploadTracks(tracks)
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });

    return subject.asObservable();
  }
}
