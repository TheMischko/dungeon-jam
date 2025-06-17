import { Injectable } from '@angular/core';
import { AudioTrack } from '@shared/models/track.model';

@Injectable({
  providedIn: 'root',
})
export class AudioFilesService {
  constructor() {}

  registerDrop(callback: (paths: AudioTrack[]) => void): void {
    (window as unknown as AudioApiWindow).AUDIO_FILES_API.registerFileDrop(
      (paths) => callback(paths),
    );
  }
}

type AudioApiWindow = {
  AUDIO_FILES_API: {
    fetchAudioData: (files: FileList) => Promise<void>;
    registerFileDrop: (callback: (paths: AudioTrack[]) => void) => void;
  };
};
