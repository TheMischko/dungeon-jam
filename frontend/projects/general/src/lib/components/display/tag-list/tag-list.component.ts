import { Component, input, output } from '@angular/core';
import { Tag } from '@shared/models/tag.model';
import { TagPillComponent } from '@general/components/display/tag-pill/tag-pill.component';

@Component({
  selector: 'lib-tag-list',
  imports: [TagPillComponent],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss',
})
export class TagListComponent {
  readonly tags = input<Tag[]>([]);
  readonly editable = input<boolean>(false);

  readonly removed = output<Tag>();

  tagRemoved(tag: Tag) {
    this.removed.emit(tag);
  }
}
