import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SmartTableComponent } from '../../../../components/table/smart-table/smart-table.component';
import { TableColumnConfiguration } from '../../../../models/table.model';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { TagListSmartComponent } from '@general/components/display/tag-list/tag-list-smart/tag-list-smart.component';
import { PlayPauseButtonComponent } from '@general/components/buttons/play-pause-button/play-pause-button.component';
import { RepeatStateButtonComponent } from '../../../../player/player/repeat-state-button/repeat-state-button.component';
import { RepeatState } from '../../../../models/playback.model';

@Component({
  selector: 'app-sound-effect-table',
  imports: [
    SmartTableComponent,
    TagListSmartComponent,
    PlayPauseButtonComponent,
    RepeatStateButtonComponent,
  ],
  templateUrl: './sound-effect-table.component.html',
  styleUrl: './sound-effect-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectTableComponent {
  readonly durationPipe = new TrackDurationPipe();
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);

  /**
   * List of currently playing Sound Effect's IDs.
   */
  readonly currentlyPlaying = input<string[]>([]);

  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();

  readonly tagColumn = viewChild.required('tagColumn', { read: TemplateRef });
  readonly playColumnTemplate = viewChild.required('playColumn', {
    read: TemplateRef,
  });
  readonly loopColumn = viewChild.required('loopColumn', { read: TemplateRef });

  readonly config: TableColumnConfiguration<SoundEffect> = {
    play: {
      title: '',
      template: () => this.playColumnTemplate(),
      width: '65px',
    },
    looping: {
      title: '',
      template: () => this.loopColumn(),
      width: '65px',
    },
    name: {
      title: 'Name',
    },
    description: {
      title: 'Description',
    },
    tags: {
      title: 'Tags',
      template: () => this.tagColumn(),
    },
    duration: {
      title: 'Length',
      customValueFn: (entity) => this.durationPipe.transform(entity.duration),
    },
  };

  emitPlayOrPause(soundEffect: SoundEffect): void {
    if (this.currentlyPlaying().includes(soundEffect.id)) {
      this.stopEffect.emit(soundEffect);
      return;
    }
    this.playEffect.emit(soundEffect);
  }

  getRepeatState(soundEffect: SoundEffect): RepeatState {
    if (soundEffect.looping) {
      return RepeatState.ALL;
    }
    return RepeatState.NONE;
  }

  protected getPlayBtnState(soundEffect: SoundEffect): 'play' | 'pause' {
    if (this.currentlyPlaying().includes(soundEffect.id)) {
      return 'pause';
    }
    return 'play';
  }
}
