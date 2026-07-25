import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Tag, TagData } from '@shared/models/tag.model';
import { NgClass, NgStyle } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet } from '@general/icons/icons';
import {
  calculateRelativeLuminance,
  hexToRGB,
} from '@general/utils/color.utils';

@Component({
  selector: 'lib-tag-pill',
  imports: [NgStyle, LucideAngularModule, NgClass],
  templateUrl: './tag-pill.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tag-pill.component.scss',
})
export class TagPillComponent {
  readonly tag = input.required<Tag | TagData>();
  readonly removable = input<boolean>(false);
  readonly highlighted = input<boolean>(false);
  readonly fontSize = input<number>(14);

  readonly removed = output<Tag | TagData>();

  readonly removeIcon = actionsIconSet.CrossIcon;

  textColor = computed(() => {
    const bgColor = this.tag().color ?? '#000000';
    const bgRGB = hexToRGB(bgColor);
    const luminance = calculateRelativeLuminance(bgRGB);
    return luminance > 0.5 ? 'black' : 'white';
  });
  pillStyles = computed(() => {
    return {
      background: this.tag().color ?? undefined,
      color: this.textColor(),
      'font-size': `${this.fontSize()}px`,
    };
  });
}
