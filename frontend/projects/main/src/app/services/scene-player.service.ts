import { inject, Injectable } from '@angular/core';
import { PlaybackService } from './playback.service';
import { SoundEffectsPlayerService } from './sound-effects-player.service';
import { ScenesStore } from '@general/stores/scenes.store';
import { TrackService } from './track.service';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { Scene, SceneSoundEffectRef } from '@shared/models/scene.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { EMPTY, from, map, Observable, of, switchMap } from 'rxjs';
import { Track } from '@shared/models/track.model';

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

  public playScene(sceneId: string): Observable<void> {
    const scene = this.scenesStore.entityMap()[sceneId];
    if (!scene) {
      console.error(`Scene with ID ${sceneId} not found.`);
      return EMPTY;
    }

    const ambience = this.getSoundEffectRefs(scene.ambience);

    if (!scene.playlistId) {
      if (ambience.length) {
        console.warn(`Scene with ID ${sceneId} has no tracks.`);
        return from(this.playAmbience(ambience));
      }
      console.error(`Scene with ID ${sceneId} has nothing to play.`);
      return EMPTY;
    }

    return this.trackService
      .getTracksByPlaylist({ playlistId: scene.playlistId })
      .pipe(
        switchMap((tracks) => {
          return this.playSceneWithData(sceneId, tracks, ambience);
        }),
        map(() => void 0)
      );
  }

  public playSceneWithData(
    sceneId: string,
    tracks: Track[],
    ambience: SoundEffect[]
  ): Observable<void> {
    return from(
      tracks.length > 0
        ? this.playbackService.playTracks(tracks, { sceneId })
        : of(void 0)
    ).pipe(
      switchMap(() =>
        !!ambience?.length ? from(this.playAmbience(ambience)) : of(void 0)
      )
    );
  }

  public stopScene(scene: Scene): void {
    this.playbackService.clearState();
    [...scene.ambience, ...scene.stingers].forEach((soundEffectRef) => {
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
}
