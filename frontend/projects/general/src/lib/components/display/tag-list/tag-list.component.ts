import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Tag, TagData } from '@shared/models/tag.model';
import { TagPillComponent } from '@general/components/display/tag-pill/tag-pill.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'lib-tag-list',
  imports: [TagPillComponent, MatTooltip],
  templateUrl: './tag-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tag-list.component.scss',
})
export class TagListComponent {
  readonly tags = input<TagData[]>([]);
  readonly editable = input<boolean>(false);
  readonly maxShownTags = input<number | null>(null);
  readonly priorityValue = input<string | null>(null);
  readonly fontSize = input<number>(14);

  readonly shownTags = computed<TagData[]>(() => {
    if (this.maxShownTags() !== null) {
      if (this.maxShownTags()! <= 0) {
        return [];
      }
      return this.tags().slice(0, this.maxShownTags()!);
    }
    return this.tags();
  });

  readonly removed = output<TagData>();

  tagRemoved(tag: Tag | TagData) {
    this.removed.emit(tag as TagData);
  }

  leftoverTagCount = computed<Tag | null>(() => {
    if (this.maxShownTags() === null) {
      return null;
    }
    const count = this.tags().length - this.maxShownTags()!;
    if (count <= 0) {
      return null;
    }
    if (count === this.tags().length) {
      return {
        title: `${count}`,
      };
    }
    return {
      title: `+${count}`,
    };
  });

  leftoverTagsTooltip = computed<string>(() => {
    if (this.maxShownTags() === null) {
      return '';
    }
    const leftoverTags = this.tags().slice(this.maxShownTags()!);
    return leftoverTags.map((tag) => tag.title).join(' ');
  });

  protected matchesPriority(tag: TagData): boolean {
    const priorityValue = this.priorityValue();
    if (!priorityValue) {
      return false;
    }
    return tag.title.includes(priorityValue);
  }
}
