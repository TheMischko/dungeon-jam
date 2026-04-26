import { inject, Injectable } from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { LRUCache } from '@general/utils/lru-cache';
import { LoadSoundService } from './load-sound.service';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class SoundEffectsPlayerService {
  private readonly loadSoundService = inject(LoadSoundService);

  private soundEffectStateMap = new Map<string, SoundEffectPlayState>();
  private effectDataCache = new LRUCache<string, Blob>(10);
  private effectObjectURLMap = new Map<string, string>();

  public async playEffect(
    soundEffect: SoundEffect,
    loop: boolean = false
  ): Promise<void> {
    if (this.soundEffectStateMap.has(soundEffect.id)) {
      return;
    }
    const shouldLoop = loop || (soundEffect?.looping ?? false);
    const howl = await this.createHowl(soundEffect, shouldLoop);
    this.soundEffectStateMap.set(soundEffect.id, {
      phase: SoundEffectPlayPhase.LOADING,
      soundEffect,
      howl,
      loop: shouldLoop,
    });
    howl.play();
  }

  public async stopEffect(soundEffect: SoundEffect): Promise<void> {
    const state = this.soundEffectStateMap.get(soundEffect.id);
    if (!state) {
      return;
    }
    state.howl.stop();
  }

  private async createHowl(
    soundEffect: SoundEffect,
    loop: boolean = false
  ): Promise<Howl> {
    const soundBlobUrl = await this.getBlobUrl(soundEffect);
    const howl = new Howl({
      src: [soundBlobUrl],
      html5: true,
      format: '',
      volume: 0.5,
      loop,
    });

    howl.load();

    howl.on('play', () => {
      const effectState = this.soundEffectStateMap.get(soundEffect.id);
      if (!effectState) {
        howl.stop();
        return;
      }
      this.soundEffectStateMap.set(soundEffect.id, {
        ...effectState,
        phase: SoundEffectPlayPhase.PLAYING,
      });
    });
    howl.on('end', () => {
      this.cleanSoundEffectData(soundEffect);
    });
    howl.on('stop', () => {
      this.cleanSoundEffectData(soundEffect);
    });
    return howl;
  }

  private cleanSoundEffectData(soundEffect: SoundEffect): void {
    const blobUrl = this.effectObjectURLMap.get(soundEffect.id);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.effectObjectURLMap.delete(soundEffect.id);
    }

    const state = this.soundEffectStateMap.get(soundEffect.id);
    if (state) {
      state.howl.unload();
      this.soundEffectStateMap.delete(soundEffect.id);
    }
  }

  /**
   * Creates Blob data from sound URL and sync it with URL cache.
   */
  private async getBlobUrl(soundEffect: SoundEffect): Promise<string> {
    if (this.effectObjectURLMap.has(soundEffect.id)) {
      return this.effectObjectURLMap.get(soundEffect.id)!;
    }
    const soundBlob = await this.getEffectData(soundEffect);
    const soundBlobUrl = URL.createObjectURL(soundBlob);
    this.effectObjectURLMap.set(soundEffect.id, soundBlobUrl);
    return soundBlobUrl;
  }

  /**
   * Loads the Sound Effect either from cache, or through API and updates cache.
   */
  private async getEffectData(soundEffect: SoundEffect): Promise<Blob> {
    const cacheData = this.effectDataCache.get(soundEffect.id);
    if (cacheData) {
      return cacheData;
    }
    const data = await this.loadSoundService.loadSoundEffect(soundEffect);
    this.effectDataCache.put(soundEffect.id, data);
    return data;
  }
}

type SoundEffectPlayState = {
  phase: SoundEffectPlayPhase;
  soundEffect: SoundEffect;
  howl: Howl;
  loop: boolean;
};

enum SoundEffectPlayPhase {
  LOADING,
  PLAYING,
}
