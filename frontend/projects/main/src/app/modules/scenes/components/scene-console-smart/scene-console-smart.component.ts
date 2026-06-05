import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { PlaylistTracksStore } from '../../../../stores/playlist-tracks.store';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { Playlist } from '@shared/models/playlist.model';
import { Track } from '@shared/models/track.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { TagsStore } from '@general/stores/tags.store';
import { SceneConsoleComponent } from '../scene-console/scene-console.component';
import { ImageApiService } from '@general/services/image-api.service';
import { ListChanged } from '../../../../../../../general/models/list-changed.model';
import { ScenesStore } from '@general/stores/scenes.store';
import { DialogService } from '../../../../services/dialog.service';
import { SelectSoundEffectsModalComponent } from '../../../sound-effects/modals/select-sound-effects-modal/select-sound-effects-modal.component';
import { SelectSoundEffectsSelection } from '../../../sound-effects/modals/select-sound-effects-modal/select-sound-effects-modal.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { SoundEffectVolumeChange } from '../../../../models/sound-effect.model';

@Component({
  selector: 'app-scene-console-smart',
  imports: [SceneConsoleComponent],
  templateUrl: './scene-console-smart.component.html',
  styleUrl: './scene-console-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneConsoleSmartComponent implements OnInit {
  readonly playlistStore = inject(PlaylistStore);
  readonly playlistTracksStore = inject(PlaylistTracksStore);
  readonly soundEffectStore = inject(SoundEffectStore);
  readonly tagsStore = inject(TagsStore);
  readonly imageApiService = inject(ImageApiService);
  readonly scenesStore = inject(ScenesStore);
  readonly dialogService = inject(DialogService);
  readonly destroyRef = inject(DestroyRef);

  readonly scene = input.required<Scene>();

  readonly tagsMap = this.tagsStore.entityMap;
  readonly playlist = signal<Playlist | undefined>(undefined);
  readonly tracks = signal<Track[]>([]);
  readonly ambience = signal<SoundEffect[]>([]);
  readonly stingers = signal<SoundEffect[]>([]);
  readonly sceneImageUrl = signal<string | undefined>(undefined);

  private trackLoadTimeout: number | undefined = undefined;

  constructor() {
    effect(() => {
      const scene = this.scene();
      const playlists = this.playlistStore.entityMap();
      if (!scene.playlistId) {
        return;
      }
      const playlist = playlists[scene.playlistId];
      if (!playlist) {
        return;
      }
      this.playlist.set(playlist);

      if (this.trackLoadTimeout) {
        clearTimeout(this.trackLoadTimeout);
      }

      this.trackLoadTimeout = setTimeout(() => {
        this.playlistTracksStore.load({
          playlistId: playlist.id,
        });
        this.trackLoadTimeout = undefined;
      }, 250);

      return () => {
        if (this.trackLoadTimeout) {
          clearTimeout(this.trackLoadTimeout);
          this.trackLoadTimeout = undefined;
        }
      };
    });

    effect(() => {
      const playlistTracks = this.playlistTracksStore.entities();
      this.tracks.set(playlistTracks);
    });

    effect(() => {
      const scene = this.scene();
      const soundEffects = this.soundEffectStore.entityMap();

      if (!scene || !soundEffects) {
        return;
      }

      const ambience = scene.ambience
        .map((soundEffectRef) => {
          const soundEffect = soundEffects[soundEffectRef.soundEffectId];
          if (!soundEffect) {
            return undefined;
          }
          return {
            ...soundEffect,
            volume: soundEffectRef.volume,
          } as SoundEffect;
        })
        .filter((sfx) => !!sfx);
      this.ambience.set(ambience);

      const stingers = scene.stingers
        .map((soundEffectRef) => {
          const soundEffect = soundEffects[soundEffectRef.soundEffectId];
          if (!soundEffect) {
            return undefined;
          }
          return {
            ...soundEffect,
            volume: soundEffectRef.volume,
          } as SoundEffect;
        })
        .filter((sfx) => !!sfx);
      this.stingers.set(stingers);
    });

    effect(() => {
      const scene = this.scene();
      if (!scene || !scene.imageUrl) {
        return;
      }
      const imageSub = this.imageApiService
        .fetchImage(scene.imageUrl)
        .subscribe((image) => {
          if (!image) {
            return;
          }
          this.sceneImageUrl.set(image);
        });

      return () => {
        imageSub.unsubscribe();
      };
    });
  }

  ngOnInit() {
    if (
      !this.playlistStore.entities().length &&
      !this.playlistStore.loading()
    ) {
      this.playlistStore.load({});
    }
    if (
      !this.soundEffectStore.entities().length &&
      !this.soundEffectStore.loading()
    ) {
      this.soundEffectStore.loadAll({});
    }
    if (!this.tagsStore.entities().length && !this.tagsStore.loading()) {
      this.tagsStore.loadAll({});
    }
  }

  changeAmbienceSelection(): void {
    const ambience = this.ambience();
    this.changeSelectionInModal(ambience).subscribe((selection) => {
      if (!selection) {
        return;
      }
      const changes = this.getSelectionChanges(ambience, selection);
      this.updateAmbience(changes);
    });
  }

  changeStingerSelection(): void {
    const stingers = this.stingers();
    this.changeSelectionInModal(stingers).subscribe((selection) => {
      if (!selection) {
        return;
      }
      const changes = this.getSelectionChanges(stingers, selection);
      this.updateStingers(changes);
    });
  }

  protected updateAmbience(changes: ListChanged<SoundEffect>): void {
    this.scenesStore.update({
      id: this.scene().id,
      ...(changes.added && {
        ambienceAdded: changes.added.map((soundEffect) => soundEffect.id),
      }),
      ...(changes.removed && {
        ambienceRemoved: changes.removed.map((soundEffect) => soundEffect.id),
      }),
    });
  }

  protected updateStingers(changes: ListChanged<SoundEffect>): void {
    this.scenesStore.update({
      id: this.scene().id,
      ...(changes.added && {
        stingersAdded: changes.added.map((soundEffect) => soundEffect.id),
      }),
      ...(changes.removed && {
        stingersRemoved: changes.removed.map((soundEffect) => soundEffect.id),
      }),
    });
  }

  protected getSelectionChanges(
    originals: SoundEffect[],
    updated: SoundEffect[]
  ): ListChanged<SoundEffect> {
    const added = updated.filter(
      (soundEffect) => !originals.includes(soundEffect)
    );
    const removed = originals.filter(
      (soundEffect) => !updated.includes(soundEffect)
    );

    return {
      added,
      removed,
    };
  }

  protected changeSelectionInModal(
    selection: SoundEffect[] = []
  ): Observable<SoundEffect[] | undefined> {
    const dialog = this.dialogService.open<
      SelectSoundEffectsModalComponent,
      SelectSoundEffectsSelection
    >(SelectSoundEffectsModalComponent, {
      data: {
        selectedSoundEffects: selection,
      },
    });

    return dialog.afterClosed$.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((response: SelectSoundEffectsSelection | undefined) => {
        return response?.selectedSoundEffects;
      })
    );
  }

  protected playAmbience() {
    console.log('Play Ambience');
  }

  protected pauseAmbience() {
    console.log('Pause Ambience');
  }

  protected playSoundEffect(soundEffect: SoundEffect) {
    console.log('Play sfx', soundEffect);
  }

  protected pauseSoundEffect(soundEffect: SoundEffect) {
    console.log('Pause sfx', soundEffect);
  }

  protected changeSoundEffectVolume(event: SoundEffectVolumeChange) {
    console.log('Update sfx volume', event);
  }
}
