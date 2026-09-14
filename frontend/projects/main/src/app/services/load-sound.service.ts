import { Injectable } from '@angular/core';
import { AudioApiWindow } from '../models/window-api.model';
import { SoundEffect } from '@shared/models/sound-effect.model';

@Injectable({
  providedIn: 'root',
})
export class LoadSoundService {
  private readonly window: AudioApiWindow = <AudioApiWindow>window;

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
