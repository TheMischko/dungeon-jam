import {
  ChangeDetectionStrategy,
  Component,
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

      console.log(scene);

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
}
