import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
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
  readonly playlist = input<Playlist>();
  readonly tracks = input<Track[]>([]);
  readonly ambience = input<SoundEffect[]>([]);
  readonly stingers = input<SoundEffect[]>([]);
  readonly tagsMap = input<Record<string, Tag>>({});
  readonly sceneImageUrl = input<string>();

  readonly loading = computed(() => {
    return (
      !this.scene() || !this.playlist() || !Object.keys(this.tagsMap()).length
    );
  });

  readonly excludedColumns: (keyof Track)[] = ['author', 'tags'];
  protected readonly ButtonType = ButtonType;

  protected addToAmbience(soundEffects: SoundEffect[]) {}

  protected addToStingers(soundEffects: SoundEffect[]) {}
}
