import { Injectable } from '@angular/core';
import { AudioTrack, Track } from '@shared/models/track.model';
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

  uploadAudioTracks(tracks: AudioTrack[]): Observable<Track[]> {
    const subject = new Subject<Track[]>();

    this.window.AUDIO_FILES_API.uploadTracks(tracks)
      .then((result) => {
        subject.next(result);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });

    return subject.asObservable();
  }

  /**
   * Opens a native OS file picker dialog for picking files.
   *
   * After submitting the paths are analyzed and audio track data is emitted
   * into an observable result.
   */
  openAudioFileDialog(): Observable<AudioTrack[]> {
    const subject = new Subject<AudioTrack[]>();

    this.window.AUDIO_FILES_API.openAudioFileDialog()
      .then((paths) => {
        subject.next(paths);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      });

    return subject.asObservable();
  }
}
