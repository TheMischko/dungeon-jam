import {
  ChangeDetectionStrategy,
  Component,
  input, output,
} from '@angular/core';
import { TagRow } from '../../models/tag-row.model';
import { TagsTableComponent } from './tags-table/tags-table.component';

@Component({
  selector: 'app-tags-page',
  imports: [TagsTableComponent, TagsTableComponent],
  templateUrl: './tags-page.component.html',
  styleUrl: './tags-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagsPageComponent {
  readonly tags = input<TagRow[]>([]);
  readonly loading = input<boolean>(false);

  readonly showTagDetail = output<TagRow>();
}
