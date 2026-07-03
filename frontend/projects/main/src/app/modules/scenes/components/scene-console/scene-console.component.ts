import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Scene } from '@shared/models/scene.model';
import { Playlist } from '@shared/models/playlist.model';
import { Track } from '@shared/models/track.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { Tag } from '@shared/models/tag.model';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { SongsTableComponent } from '../../../library/pages/library-landing-page/songs-table/songs-table.component';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { TagListSmartComponent } from '@general/components/display/tag-list/tag-list-smart/tag-list-smart.component';
import { ButtonType } from '../../../../../../../general/models/button.model';
import { SceneSoundEffectsListComponent } from '../scene-sound-effects-list/scene-sound-effects-list.component';
import { AddSoundEffectsSectionComponent } from '../add-sound-effects-section/add-sound-effects-section.component';
import { SoundEffectVolumeChange } from '../../../../models/sound-effect.model';
import { QueryOptions } from '@shared/models/request.model';

@Component({
  selector: 'app-scene-console',
  imports: [
    LoaderComponent,
    SongsTableComponent,
    PlayPauseButtonComponent,
    TagListSmartComponent,
    SceneSoundEffectsListComponent,
    AddSoundEffectsSectionComponent,
  ],
  templateUrl: './scene-console.component.html',
  styleUrl: './scene-console.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneConsoleComponent {
  readonly scene = input<Scene>();
  readonly scenePlaying = input<boolean>();
  readonly playlist = input<Playlist>();
  readonly tracks = input<Track[]>([]);
  readonly ambience = input<SoundEffect[]>([]);
  readonly stingers = input<SoundEffect[]>([]);
  readonly tagsMap = input<Record<string, Tag>>({});
  readonly sceneImageUrl = input<string>();
  readonly ambiencePlayMap = input<Record<string, boolean>>({});
  readonly stingersPlayMap = input<Record<string, boolean>>({});
  readonly playingTrack = input<Track | null>();
  readonly soundEffectsVolumeMap = input<Record<string, number>>({});

  readonly playScene = output<void>();
  readonly pauseScene = output<void>();
  readonly playTrack = output<Track>();
  readonly pauseTrack = output<void>();
  readonly changeAmbience = output<void>();
  readonly changeStingers = output<void>();
  readonly playAmbience = output<void>();
  readonly pauseAmbience = output<void>();
  readonly playAmbienceSoundEffect = output<SoundEffect>();
  readonly playStingerSoundEffect = output<SoundEffect>();
  readonly pauseSoundEffect = output<SoundEffect>();
  readonly changeSoundEffectVolume = output<SoundEffectVolumeChange>();
  readonly trackQueryChange = output<QueryOptions>();

  readonly loading = computed(() => {
    return (
      !this.scene() || !this.playlist() || !Object.keys(this.tagsMap()).length
    );
  });
  readonly playingTrackId = computed(() => {
    const track = this.playingTrack();
    if (!track) {
      return null;
    }
    return track.id;
  });

  readonly scenePlayButtonState = computed(() => {
    return this.scenePlaying() ? 'pause' : 'play';
  });

  readonly scenePlayButtonText = computed(() => {
    const playing = this.scenePlaying();
    if (!playing) {
      return 'Play scene';
    }
    return 'Pause scene';
  });

  readonly excludedColumns: (keyof Track)[] = ['author', 'tags'];
  protected readonly ButtonType = ButtonType;

  protected toggleScenePlaying(newState: 'play' | 'pause') {
    if (newState === 'play') {
      this.playScene.emit();
      return;
    }
    this.pauseScene.emit();
  }
}
