import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TagsStore } from '@general/stores/tags.store';
import { TagApiService } from '@general/services/tag-api.service';
import { TagRow } from '../../../models/tag-row.model';
import { TagsPageComponent } from '../tags-page.component';

@Component({
  selector: 'app-tags-page-smart',
  imports: [TagsPageComponent],
  templateUrl: './tags-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsPageSmartComponent implements OnInit {
  private readonly tagsStore = inject(TagsStore);
  private readonly tagApiService = inject(TagApiService);

  private readonly trackCounts = signal<Record<string, number>>({});

  readonly loading = this.tagsStore.loading;

  readonly tags = computed<TagRow[]>(() => {
    const counts = this.trackCounts();
    return this.tagsStore.entities().map((tag) => ({
      ...tag,
      trackCount: counts[tag.id] ?? 0,
    }));
  });

  ngOnInit(): void {
    this.tagApiService.getTagsTrackCount().subscribe((counts) => {
      this.trackCounts.set(counts);
    });
  }
}
