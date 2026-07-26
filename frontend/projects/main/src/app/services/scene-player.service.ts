import { inject, Injectable, signal } from '@angular/core';
import { PlaybackService } from './playback.service';
import { SoundEffectsPlayerService } from './sound-effects-player.service';
import { ScenesStore } from '@general/stores/scenes.store';
import { TrackService } from './track.service';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { Scene, SceneSoundEffectRef } from '@shared/models/scene.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { EMPTY, from, map, Observable, of, switchMap } from 'rxjs';
import { Track } from '@shared/models/track.model';
import { ToastService } from '@general/services/toast.service';
import { ToastType } from '../../../../general/models/toast.model';
import { PlayMetadata } from '../models/playback.model';

@Injectable({
  providedIn: 'root',
})
export class ScenePlayerService {
  private readonly playbackService = inject(PlaybackService);
  private readonly soundEffectsPlayerService = inject(
    SoundEffectsPlayerService
  );
  private readonly scenesStore = inject(ScenesStore);
  private readonly trackService = inject(TrackService);
  private readonly soundEffectStore = inject(SoundEffectStore);
  private readonly toastService = inject(ToastService);

  private readonly playingScene = signal<Scene | undefined>(undefined);

  constructor() {
    if (!this.scenesStore.entities().length && !this.scenesStore.loading()) {
      this.scenesStore.loadAll({});
    }
    if (
      !this.soundEffectStore.entities().length &&
      !this.soundEffectStore.loading()
    ) {
      this.soundEffectStore.loadAll({});
    }
  }

  public playScene(sceneId: string, sessionId?: string): Observable<void> {
    const scene = this.scenesStore.entityMap()[sceneId];
    if (!scene) {
      console.error(`Scene with ID ${sceneId} not found.`);
      this.toastService.createToast(
        'Play error',
        'Scene not found.',
        ToastType.Error
      );
      return EMPTY;
    }

    const ambience = this.getSoundEffectRefs(scene.ambience);

    if (!scene.playlistId) {
      if (ambience.length) {
        console.warn(`Scene with ID ${sceneId} has no tracks.`);
        return from(this.playAmbience(ambience));
      }
      this.toastService.createToast(
        'Play error',
        'Scene has nothing to play.',
        ToastType.Error
      );
      console.error(`Scene with ID ${sceneId} has nothing to play.`);
      return EMPTY;
    }

    return this.trackService
      .getTracksByPlaylist({ playlistId: scene.playlistId })
      .pipe(
        switchMap((tracks) => {
          return this.playSceneWithData(scene, tracks, ambience, sessionId);
        }),
        map(() => void 0)
      );
  }

  public playSceneWithData(
    scene: Scene,
    tracks: Track[],
    ambience: SoundEffect[],
    sessionId?: string
  ): Observable<void> {
    const currentlyPlayingScene = this.playingScene();
    if (currentlyPlayingScene) {
      this.stopScene(currentlyPlayingScene, ambience);
    }

    this.playingScene.set(scene);

    return from(
      tracks.length > 0
        ? this.playbackService.playTracks(
            tracks,
            this.getPlayMetadata(scene, sessionId)
          )
        : of(void 0)
    ).pipe(
      switchMap(() =>
        !!ambience?.length ? from(this.playAmbience(ambience)) : of(void 0)
      )
    );
  }

  /**
   * Stop the playing scene; its music and sound effects.
   * @param scene Scene to stop playing.
   * @param omitAmbience List of ambience to keep playing.
   */
  public stopScene(scene: Scene, omitAmbience: SoundEffect[] = []): void {
    this.playbackService.clearState();
    this.playingScene.set(undefined);
    const omitAmbienceIds = omitAmbience.map((a) => a.id);
    const ambienceToStop = scene.ambience.filter(
      (a) => !omitAmbienceIds.includes(a.soundEffectId)
    );

    ambienceToStop.forEach((soundEffectRef) => {
      this.soundEffectsPlayerService.stopEffect(soundEffectRef.soundEffectId);
    });
  }

  private getSoundEffectRefs(refs: SceneSoundEffectRef[]): SoundEffect[] {
    const soundEffectsMap = this.soundEffectStore.entityMap();

    return refs
      .map((ref) => {
        const soundEffect = soundEffectsMap[ref.soundEffectId];
        if (!soundEffect) return undefined;
        return {
          ...soundEffect,
          volume: ref.volume,
        };
      })
      .filter((sfx) => !!sfx);
  }

  private async playAmbience(ambience: SoundEffect[]) {
    for (const ambienceTrack of ambience) {
      await this.soundEffectsPlayerService.playEffect(ambienceTrack, true);
    }
  }

  private getPlayMetadata(scene: Scene, sessionId?: string): PlayMetadata {
    return {
      sceneId: scene.id,
      ...(sessionId && { sessionId }),
    };
  }
}
