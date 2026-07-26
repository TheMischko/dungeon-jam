import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TagData } from '@shared/models/tag.model';
import { FilterBoxComponent } from '../filter-box/filter-box.component';
import { TagApiService } from '@general/services/tag-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tags-filter',
  imports: [FilterBoxComponent],
  templateUrl: './tags-filter.component.html',
  styleUrl: './tags-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFilterComponent implements OnInit {
  readonly tagService = inject(TagApiService);
  readonly destroyRef = inject(DestroyRef);

  readonly initialIds = input<string[]>([]);

  readonly selectionChange = output<TagData[]>();

  readonly tags = signal<TagData[]>([]);
  readonly displayField: keyof TagData = 'title';
  readonly trackById = (_: number, item: TagData) => item.id;

  readonly initialSelection = computed(() => {
    const initialIds = this.initialIds();
    return this.tags().filter((t) => initialIds.includes(t.id));
  });

  ngOnInit() {
    this.tagService
      .getAllTags({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tags: TagData[]) => {
        this.tags.set(tags);
      });
  }

  emitSelection(selection: TagData[]) {
    this.selectionChange.emit(selection);
  }
}
