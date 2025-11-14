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
  readonly tagIds = input<string[]>([]);
  readonly editable = input<boolean>(false);

  readonly removed = output<Tag>();

  readonly loadedTags = computed<TagData[]>(() => {
    return [
      ...this.tags(),
      ...this.tagIds()
        .map((id) => this.tagStore.getById(id))
        .filter((tag): tag is TagData => !!tag),
    ];
  });

  tagRemoved(tag: TagData) {
    this.removed.emit(tag);
  }
}
