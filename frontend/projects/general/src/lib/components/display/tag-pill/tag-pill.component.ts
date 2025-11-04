import { Component, computed, input, output } from '@angular/core';
import { Tag } from '@shared/models/tag.model';
import { NgStyle } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet } from '@general/icons/icons';

@Component({
  selector: 'lib-tag-pill',
  imports: [NgStyle, LucideAngularModule],
  templateUrl: './tag-pill.component.html',
  styleUrl: './tag-pill.component.scss',
})
export class TagPillComponent {
  readonly tag = input.required<Tag>();
  readonly removable = input<boolean>(false);

  readonly removed = output<Tag>();

  readonly removeIcon = actionsIconSet.CrossIcon;

  colorStyles = computed(() => {
    return {
      background: this.tag().color ?? undefined,
    };
  });
}
