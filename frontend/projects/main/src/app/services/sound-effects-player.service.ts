import { inject, Injectable } from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { LRUCache } from '@general/utils/lru-cache';
import { LoadSoundService } from './load-sound.service';
import { Howl } from 'howler';
import { BehaviorSubject, map, Observable } from 'rxjs';

export interface ActiveSoundEffect {
  id: string;
  soundEffect: SoundEffect;
  phase: SoundEffectPlayPhase;
  loop: boolean;
  volume: number;
}

export enum SoundEffectPlayPhase {
  LOADING,
  PLAYING,
}

type SoundEffectInternalState = {
  soundEffect: SoundEffect;
  howl: Howl;
  phase: SoundEffectPlayPhase;
  loop: boolean;
  volume: number;
  timerId?: number;
};

@Injectable({
  providedIn: 'root',
})
export class SoundEffectsPlayerService {
  private readonly loadSoundService = inject(LoadSoundService);

  private readonly stateRecord = new BehaviorSubject<Record<string, SoundEffectInternalState>>({});
  private readonly positionRecord = new BehaviorSubject<Record<string, number>>({});
  private effectDataCache = new LRUCache<string, Blob>(10);
  private effectObjectURLMap = new Map<string, string>();

  readonly playingEffects$: Observable<ActiveSoundEffect[]> = this.stateRecord.pipe(
    map((record) => Object.values(record).map(toActiveEffect))
  );
  readonly effectPositions$: Observable<Record<string, number>> = this.positionRecord.asObservable();

  public async playEffect(
    soundEffect: SoundEffect,
    loop: boolean = false
  ): Promise<void> {
    if (this.stateRecord.getValue()[soundEffect.id]) {
      return;
    }
    const shouldLoop = loop || (soundEffect?.looping ?? false);
    const howl = await this.createHowl(soundEffect, shouldLoop);
    this.stateRecord.next({
      ...this.stateRecord.getValue(),
      [soundEffect.id]: {
        phase: SoundEffectPlayPhase.LOADING,
        soundEffect,
        howl,
        loop: shouldLoop,
        volume: 0.5,
      },
    });
    this.positionRecord.next({ ...this.positionRecord.getValue(), [soundEffect.id]: 0 });
    howl.play();
  }

  public stopEffect(soundEffectId: string): void {
    const state = this.stateRecord.getValue()[soundEffectId];
    if (!state) {
      return;
    }
    state.howl.stop();
  }

  public setEffectVolume(soundEffectId: string, volume: number): void {
    const state = this.stateRecord.getValue()[soundEffectId];
    if (!state) return;
    state.howl.volume(volume);
    this.patchState(soundEffectId, { volume });
  }

  public setEffectLoop(soundEffectId: string, loop: boolean): void {
    const state = this.stateRecord.getValue()[soundEffectId];
    if (!state) return;
    state.howl.loop(loop);
    this.patchState(soundEffectId, { loop });
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
      const effectState = this.stateRecord.getValue()[soundEffect.id];
      if (!effectState) {
        howl.stop();
        return;
      }
      this.patchState(soundEffect.id, { phase: SoundEffectPlayPhase.PLAYING });
      this.startWatchdog(soundEffect.id);
    });
    howl.on('end', () => {
      this.cleanSoundEffectData(soundEffect);
    });
    howl.on('stop', () => {
      this.cleanSoundEffectData(soundEffect);
    });
    return howl;
  }

  private patchState(id: string, patch: Partial<SoundEffectInternalState>): void {
    const current = this.stateRecord.getValue();
    if (!current[id]) return;
    this.stateRecord.next({
      ...current,
      [id]: { ...current[id], ...patch },
    });
  }

  private removeState(id: string): void {
    const { [id]: _, ...remaining } = this.stateRecord.getValue();
    this.stateRecord.next(remaining);
  }

  private startWatchdog(id: string): void {
    const timerId = setInterval(() => {
      const state = this.stateRecord.getValue()[id];
      if (state?.howl.playing()) {
        this.positionRecord.next({ ...this.positionRecord.getValue(), [id]: state.howl.seek() });
      }
    }, 250) as unknown as number;
    this.patchState(id, { timerId });
  }

  private stopWatchdog(id: string): void {
    const state = this.stateRecord.getValue()[id];
    if (state?.timerId) {
      clearInterval(state.timerId);
    }
  }

  private cleanSoundEffectData(soundEffect: SoundEffect): void {
    this.stopWatchdog(soundEffect.id);

    const { [soundEffect.id]: _, ...remainingPositions } = this.positionRecord.getValue();
    this.positionRecord.next(remainingPositions);

    const blobUrl = this.effectObjectURLMap.get(soundEffect.id);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.effectObjectURLMap.delete(soundEffect.id);
    }

    const state = this.stateRecord.getValue()[soundEffect.id];
    if (state) {
      state.howl.unload();
      this.removeState(soundEffect.id);
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

function toActiveEffect(state: SoundEffectInternalState): ActiveSoundEffect {
  return {
    id: state.soundEffect.id,
    soundEffect: state.soundEffect,
    phase: state.phase,
    loop: state.loop,
    volume: state.volume,
  };
}
