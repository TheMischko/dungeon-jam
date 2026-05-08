import { Component, computed, input, output } from '@angular/core';
import { Tag, TagData } from '@shared/models/tag.model';
import { NgClass, NgStyle } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet } from '@general/icons/icons';

@Component({
  selector: 'lib-tag-pill',
  imports: [NgStyle, LucideAngularModule, NgClass],
  templateUrl: './tag-pill.component.html',
  styleUrl: './tag-pill.component.scss',
})
export class TagPillComponent {
  readonly tag = input.required<Tag | TagData>();
  readonly removable = input<boolean>(false);
  readonly highlighted = input<boolean>(false);
  readonly fontSize = input<number>(14);

  readonly removed = output<Tag | TagData>();

  readonly removeIcon = actionsIconSet.CrossIcon;

  pillStyles = computed(() => {
    return {
      background: this.tag().color ?? undefined,
      'font-size': `${this.fontSize()}px`,
    };
  });
}
