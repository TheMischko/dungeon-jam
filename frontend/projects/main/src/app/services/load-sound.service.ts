import { Injectable } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { AudioApiWindow } from '../models/window-api.model';
import { SoundEffect } from '@shared/models/sound-effect.model';

@Injectable({
  providedIn: 'root',
})
export class LoadSoundService {
  private readonly window: AudioApiWindow = <AudioApiWindow>window;

  public async loadTrack(track: Track): Promise<Blob> {
    const data = await this.window.AUDIO_FILES_API.loadFileBase64(track.url);
    const byteChars = atob(data.base64);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: data.mimeType });
  }

  public async loadSoundEffect(soundEffect: SoundEffect): Promise<Blob> {
    const data = await this.window.AUDIO_FILES_API.loadFileBase64(
      soundEffect.url
    );
    const byteChars = atob(data.base64);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type: data.mimeType });
  }
}
