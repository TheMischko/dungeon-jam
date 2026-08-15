import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
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
import { ButtonType } from '@general';
import { SceneSoundEffectsListComponent } from '../scene-sound-effects-list/scene-sound-effects-list.component';
import { AddSoundEffectsSectionComponent } from '../add-sound-effects-section/add-sound-effects-section.component';
import { SoundEffectVolumeChange } from '../../../../models/sound-effect.model';
import { QueryOptions } from '@shared/models/request.model';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { LucideIconData } from '@lucide/angular';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';

@Component({
  selector: 'app-scene-console',
  imports: [
    LoaderComponent,
    SongsTableComponent,
    PlayPauseButtonComponent,
    TagListSmartComponent,
    SceneSoundEffectsListComponent,
    AddSoundEffectsSectionComponent,
    IconButtonComponent,
  ],
  templateUrl: './scene-console.component.html',
  styleUrl: './scene-console.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneConsoleComponent {
  readonly scene = input<Scene>();
  readonly scenePlaying = input<boolean>();
  readonly playlist = input<Playlist | null | undefined>(undefined);
  readonly tracks = input<Track[]>([]);
  readonly ambience = input<SoundEffect[]>([]);
  readonly stingers = input<SoundEffect[]>([]);
  readonly tagsMap = input<Record<string, Tag>>({});
  readonly sceneImageUrl = input<string>();
  readonly ambiencePlayMap = input<Record<string, boolean>>({});
  readonly stingersPlayMap = input<Record<string, boolean>>({});
  readonly playingTrack = input<Track | null>();
  readonly soundEffectsVolumeMap = input<Record<string, number>>({});
  readonly viewMode = input<boolean>(false);
  readonly initContentHidden = input<boolean>(false);

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
  readonly editScene = output<Scene>();
  readonly deleteScene = output<Scene>();
  readonly playTrackNext = output<Track>();

  readonly hiddenContent = signal<boolean>(false);

  readonly excludedColumns: (keyof Track)[] = ['author', 'tags'];
  readonly ButtonType = ButtonType;
  readonly CollapsedIcon = actionsIconSet.CollapsedArrowIcon;
  readonly ExpandedIcon = actionsIconSet.ExpandedArrowIcon;
  readonly EditIcon = actionsIconSet.EditIcon;
  readonly DeleteIcon = actionsIconSet.DeleteIcon;
  readonly PlayNextIcon = iconSet.PlayNextIcon;
  readonly trackGridActions: ActionsMenuBaseConfig<Track>[] = [
    {
      text: 'Play next',
      icon: this.PlayNextIcon,
      onSelected: (item) => {
        this.playTrackNext.emit(item);
      },
    },
  ];

  readonly loading = computed(() => {
    return !this.scene() || this.playlist() === undefined;
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

  readonly collapsable = computed(() => {
    return this.viewMode();
  });

  readonly toggleIcon = computed<LucideIconData>(() => {
    return this.hiddenContent() ? this.CollapsedIcon : this.ExpandedIcon;
  });

  constructor() {
    effect(() => {
      const hidden = this.initContentHidden();
      this.hiddenContent.set(hidden);
    });
  }

  protected toggleScenePlaying(newState: 'play' | 'pause') {
    if (newState === 'play') {
      this.playScene.emit();
      return;
    }
    this.pauseScene.emit();
  }

  protected toggleHideContent(): void {
    this.hiddenContent.update((current) => !current);
  }
}
