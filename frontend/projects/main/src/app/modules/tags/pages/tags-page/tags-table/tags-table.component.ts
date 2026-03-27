import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TagRow } from '../../../models/tag-row.model';
import { TableColumnConfiguration, TableTrackByFn } from '../../../../../models/table.model';
import { TableComponent } from '../../../../../components/table/table.component';

@Component({
  selector: 'app-tags-table',
  imports: [TableComponent],
  templateUrl: './tags-table.component.html',
  styleUrl: './tags-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagsTableComponent {
  readonly tags = input<TagRow[]>([]);
  readonly loading = input<boolean>(false);

  readonly tableConfig = computed<TableColumnConfiguration<TagRow>>(() => ({
    title: {
      title: 'Name',
      sortable: true,
      isDefaultSortColumn: true,
    },
    trackCount: {
      title: 'Tracks',
      sortable: false,
      width: '120px',
    },
  }));

  readonly trackByFn: TableTrackByFn<TagRow> = (_index: number, item: TagRow) =>
    item.id;
}
