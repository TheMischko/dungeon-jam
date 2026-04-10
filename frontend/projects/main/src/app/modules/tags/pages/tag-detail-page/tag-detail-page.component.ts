import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Track } from '@shared/models/track.model';
import { TagData } from '@shared/models/tag.model';

@Component({
  selector: 'app-tag-detail-page',
  imports: [],
  templateUrl: './tag-detail-page.component.html',
  styleUrl: './tag-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagDetailPageComponent {
  readonly tag = input<TagData | null>(null);
  readonly tracks = input<Track[]>([]);
  readonly loading = input<boolean>(false);

  readonly pageTitle = computed(() => {
    const tagTitle = this.tag()?.title || 'Unknown';
    const capitalizedTagName = tagTitle.charAt(0).toUpperCase() + tagTitle.slice(1);
    return `Tag detail - ${capitalizedTagName}`;
  });
}
