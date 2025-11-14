import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Tag, TagData } from '@shared/models/tag.model';
import { TagsStore } from '@general/stores/tags.store';
import { TagListComponent } from '@general/components/display/tag-list/tag-list.component';

@Component({
  selector: 'lib-tag-list-smart',
  imports: [TagListComponent],
  templateUrl: './tag-list-smart.component.html',
  styleUrl: './tag-list-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListSmartComponent {
  readonly tagStore = inject(TagsStore);

  readonly tags = input<TagData[]>([]);
  readonly priorityTagNames = input<string[]>([]);
  readonly tagIds = input<string[]>([]);
  readonly editable = input<boolean>(false);
  readonly maxShownTags = input<number | null>(null);

  readonly removed = output<Tag>();

  readonly loadedTags = computed<TagData[]>(() => {
    return [
      ...this.tags(),
      ...this.tagIds()
        .map((id) => this.tagStore.getById(id))
        .filter((tag): tag is TagData => !!tag),
    ].sort((a, b) => {
      return this.sortTagsByPriority(a, b);
    });
  });

  tagRemoved(tag: TagData) {
    this.removed.emit(tag);
  }
  sortTagsByPriority(tagA: TagData, tagB: TagData): number {
    if (!this.priorityTagNames()?.length) {
      return 0;
    }
    const aPriority = this.priorityTagNames().indexOf(tagA.title);
    const bPriority = this.priorityTagNames().indexOf(tagB.title);
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    } else if (aPriority !== -1) {
      return -1;
    } else if (bPriority !== -1) {
      return 1;
    }
    return 0;
  }
}
