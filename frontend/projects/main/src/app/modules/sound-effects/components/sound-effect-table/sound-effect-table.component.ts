import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SmartTableComponent } from '../../../../components/table/smart-table/smart-table.component';
import { TableColumnConfiguration } from '../../../../models/table.model';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { TagListSmartComponent } from '@general/components/display/tag-list/tag-list-smart/tag-list-smart.component';

@Component({
  selector: 'app-sound-effect-table',
  imports: [SmartTableComponent, TagListSmartComponent],
  templateUrl: './sound-effect-table.component.html',
  styleUrl: './sound-effect-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectTableComponent {
  readonly durationPipe = new TrackDurationPipe();
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);

  readonly tagColumn = viewChild.required('tagColumn', { read: TemplateRef });

  readonly config: TableColumnConfiguration<SoundEffect> = {
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
}
