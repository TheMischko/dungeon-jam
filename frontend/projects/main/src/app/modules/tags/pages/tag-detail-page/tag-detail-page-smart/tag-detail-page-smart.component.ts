import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { taggedTracksStore } from '../../../../../stores/tagged-tracks.store';
import { TagsStore } from '@general/stores/tags.store';
import { TagDetailPageComponent } from '../tag-detail-page.component';
import { TaggedTracksQuery } from '@shared/models/track.model';

@Component({
  selector: 'app-tag-detail-page-smart',
  imports: [TagDetailPageComponent],
  templateUrl: './tag-detail-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDetailPageSmartComponent implements OnInit {
  private readonly tracksStore = inject(taggedTracksStore);
  private readonly tagsStore = inject(TagsStore);

  readonly tagId = input<string>('', { alias: 'id' });

  readonly tag = computed(() => this.tagsStore.entityMap()[this.tagId()] ?? null);
  readonly tracks = this.tracksStore.entities;
  readonly loading = this.tracksStore.loading;

  readonly loadQuery = computed<TaggedTracksQuery>(() => ({
    tagId: this.tagId(),
  }));

  ngOnInit(): void {
    this.tracksStore.load(this.loadQuery);
  }
}
