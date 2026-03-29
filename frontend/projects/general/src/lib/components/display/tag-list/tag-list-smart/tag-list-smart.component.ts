import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed, ElementRef,
  inject,
  input, OnDestroy,
  output, signal,
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
export class TagListSmartComponent implements AfterViewInit, OnDestroy{
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly tagStore = inject(TagsStore);

  readonly tags = input<TagData[]>([]);
  readonly tagIds = input<string[]>([]);
  readonly priorityValue = input<string | null>(null);
  readonly editable = input<boolean>(false);

  readonly removed = output<Tag>();

  private readonly AVG_TAG_WIDTH = 80;
  readonly maxShownTags = signal<number | null>(null);

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
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(){
    this.resizeObserver = new ResizeObserver((entries) => {
      if(entries[0]){
        const width = entries[0].contentRect.width;
        this.updateMaxShownTags(width);
      }
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
    this.updateMaxShownTags(this.elementRef.nativeElement.clientWidth);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  protected tagRemoved(tag: TagData) {
    this.removed.emit(tag);
  }

  private sortTagsByPriority(tagA: TagData, tagB: TagData): number {
    const priorityValue = this.priorityValue();
    if (!priorityValue) {
      return 0;
    }
    const aPriority = tagA.title.indexOf(priorityValue);
    const bPriority = tagB.title.indexOf(priorityValue);
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    } else if (aPriority !== -1) {
      return -1;
    } else if (bPriority !== -1) {
      return 1;
    }
    return 0;
  }

  private updateMaxShownTags(containerWidth: number) {
    if (containerWidth <= 0) {
      this.maxShownTags.set(0);
      return;
    }

    const possibleTags = Math.floor(containerWidth / this.AVG_TAG_WIDTH);
    this.maxShownTags.set(possibleTags);
  }
}
