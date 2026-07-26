import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TagsStore } from '@general/stores/tags.store';
import { TagRow } from '../../../models/tag-row.model';
import { TagsPageComponent } from '../tags-page.component';
import { Router } from '@angular/router';
import { tagRouteStrings } from '../../../tag-route-strings';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';

@Component({
  selector: 'app-tags-page-smart',
  imports: [TagsPageComponent],
  templateUrl: './tags-page-smart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsPageSmartComponent implements OnInit {
  private readonly tagsStore = inject(TagsStore);
  private readonly router = inject(Router);

  protected currentQuery = signal<QueryOptions>({
    sortBy: 'title',
    sortDirection: SortDirection.ASC
  });

  readonly loading = this.tagsStore.loading;

  readonly tags = computed<TagRow[]>(() => {
    const tagDetails = this.tagsStore.details();

    return Object.keys(tagDetails).map((id) => {
      const detail = tagDetails[id];
      return {
        id: detail.id,
        title: detail.title,
        color: detail.color,
        trackCount: detail.assignedTracks.length,
        playlistCount: detail.assignedPlaylists.length
      } as TagRow
    });
  });

  ngOnInit(): void {
    this.tagsStore.loadDetails(this.currentQuery);
  }

  protected async showTagDetail(tagData: TagRow) {
    await this.router.navigate([tagRouteStrings.detail, tagData.id], { relativeTo: this.router.routerState.root.firstChild });
  }
}
