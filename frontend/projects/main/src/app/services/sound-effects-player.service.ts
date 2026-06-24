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

  // Maps Sound effect ID to a player state
  private readonly stateRecord = new BehaviorSubject<
    Record<string, SoundEffectInternalState>
  >({});
  // Maps Sound effect ID to a playback position
  private readonly positionRecord = new BehaviorSubject<Record<string, number>>(
    {}
  );
  private effectDataCache = new LRUCache<string, Blob>(10, (effectId, _) => {
    const url = this.effectObjectURLMap.get(effectId);
    if (url) {
      URL.revokeObjectURL(url);
      this.effectObjectURLMap.delete(effectId);
    }
  });
  private effectObjectURLMap = new Map<string, string>();
  private readonly pendingPlayById = new Map<string, Promise<void>>();

  readonly playingEffects$: Observable<ActiveSoundEffect[]> =
    this.stateRecord.pipe(
      map((record) => Object.values(record).map(toActiveEffect))
    );
  readonly effectPositions$: Observable<Record<string, number>> =
    this.positionRecord.asObservable();

  public async playEffect(
    soundEffect: SoundEffect,
    loop: boolean = false
  ): Promise<void> {
    if (this.stateRecord.getValue()[soundEffect.id]) {
      return;
    }

    const pendingPlay = this.pendingPlayById.get(soundEffect.id);
    if (pendingPlay) {
      await pendingPlay;
      return;
    }

    const startPromise = this.startEffectInternal(soundEffect, loop);
    this.pendingPlayById.set(soundEffect.id, startPromise);

    try {
      await startPromise;
    } finally {
      if (this.pendingPlayById.get(soundEffect.id) === startPromise) {
        this.pendingPlayById.delete(soundEffect.id);
      }
    }
  }

  private async startEffectInternal(
    soundEffect: SoundEffect,
    loop: boolean
  ): Promise<void> {
    const shouldLoop = loop || (soundEffect?.looping ?? false);
    let howl: Howl | undefined;

    try {
      howl = await this.createHowl(soundEffect);
      this.stateRecord.next({
        ...this.stateRecord.getValue(),
        [soundEffect.id]: {
          phase: SoundEffectPlayPhase.LOADING,
          soundEffect,
          howl,
          loop: shouldLoop,
          volume: 0.1,
        },
      });
      this.positionRecord.next({
        ...this.positionRecord.getValue(),
        [soundEffect.id]: 0,
      });
      howl.play();
    } catch (error: unknown) {
      this.cleanSoundEffectDataById(soundEffect.id, howl);
      throw error;
    }
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
    this.patchState(soundEffectId, { loop });
  }

  private async createHowl(soundEffect: SoundEffect): Promise<Howl> {
    const soundBlobUrl = await this.getBlobUrl(soundEffect);
    const howl = new Howl({
      src: [soundBlobUrl],
      html5: true,
      format: '',
      volume: soundEffect?.volume ?? 1,
      loop: false,
    });

    howl.load();

    howl.on('play', () => this.handleHowlPlay(soundEffect.id, howl));
    howl.on('end', () => this.handleHowlEnd(soundEffect.id));
    howl.on('stop', () => this.handleHowlStop(soundEffect.id));
    howl.on('playerror', (_, err) =>
      this.handleHowlPlayError(soundEffect.id, howl, err)
    );

    return howl;
  }

  private handleHowlPlay(soundEffectId: string, howl: Howl): void {
    const effectState = this.stateRecord.getValue()[soundEffectId];
    if (!effectState) {
      howl.stop();
      return;
    }
    this.patchState(soundEffectId, { phase: SoundEffectPlayPhase.PLAYING });
    this.startWatchdog(soundEffectId);
  }

  private async handleHowlEnd(soundEffectId: string): Promise<void> {
    const effectState = this.stateRecord.getValue()[soundEffectId];
    if (!effectState) return;

    if (effectState.loop) {
      effectState.howl.play();
      effectState.howl.seek(0);
      return;
    }
    this.cleanSoundEffectDataById(soundEffectId);
  }

  private handleHowlStop(soundEffectId: string): void {
    this.cleanSoundEffectDataById(soundEffectId);
  }

  private handleHowlPlayError(
    soundEffectId: string,
    howl: Howl,
    error: unknown
  ): void {
    console.error('Failed to play sound effect', soundEffectId, error);
    this.cleanSoundEffectDataById(soundEffectId, howl);
  }

  private patchState(
    id: string,
    patch: Partial<SoundEffectInternalState>
  ): void {
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
    this.stopWatchdog(id);
    const timerId = setInterval(() => {
      const state = this.stateRecord.getValue()[id];
      if (state?.howl.playing()) {
        this.positionRecord.next({
          ...this.positionRecord.getValue(),
          [id]: state.howl.seek(),
        });
      }
    }, 250) as unknown as number;
    this.patchState(id, { timerId });
  }

  private stopWatchdog(id: string): void {
    const state = this.stateRecord.getValue()[id];
    if (state?.timerId) {
      clearInterval(state.timerId);
      this.patchState(id, { timerId: undefined });
    }
  }

  private cleanSoundEffectDataById(soundEffectId: string, howl?: Howl): void {
    this.stopWatchdog(soundEffectId);

    const { [soundEffectId]: _, ...remainingPositions } =
      this.positionRecord.getValue();
    this.positionRecord.next(remainingPositions);

    const blobUrl = this.effectObjectURLMap.get(soundEffectId);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.effectObjectURLMap.delete(soundEffectId);
    }

    const state = this.stateRecord.getValue()[soundEffectId];
    if (state) {
      state.howl.unload();
      this.removeState(soundEffectId);
      return;
    }

    howl?.unload();
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
