import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { TagsStore } from '@general/stores/tags.store';
import { TagData } from '@shared/models/tag.model';
import { FilterBoxComponent } from '../filter-box/filter-box.component';

@Component({
  selector: 'app-tags-filter',
  imports: [FilterBoxComponent],
  templateUrl: './tags-filter.component.html',
  styleUrl: './tags-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFilterComponent {
  readonly tagStore = inject(TagsStore);
  readonly tags = this.tagStore.entities;
  readonly displayField: keyof TagData = 'title';
  readonly trackById = (_: number, item: TagData) => item.id;
  readonly selectionChange = output<TagData[]>();

  emitSelection(selection: TagData[]) {
    this.selectionChange.emit(selection);
  }
}
