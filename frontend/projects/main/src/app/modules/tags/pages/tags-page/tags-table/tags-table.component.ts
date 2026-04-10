import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TagRow } from '../../../models/tag-row.model';
import { TableColumnConfiguration, TableTrackByFn } from '../../../../../models/table.model';
import { SmartTableComponent } from '../../../../../components/table/smart-table/smart-table.component';
import {
  ActionsMenuComponent,
  ActionsMenuConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { TagPillComponent } from '@general/components/display/tag-pill/tag-pill.component';
import { QueryOptions } from '@shared/models/request.model';

@Component({
  selector: 'app-tags-table',
  imports: [
    SmartTableComponent,
    ActionsMenuComponent,
    IconButtonComponent,
    MatMenuTrigger,
    MatMenu,
    TagPillComponent,
  ],
  templateUrl: './tags-table.component.html',
  styleUrl: './tags-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TagsTableComponent {
  readonly tags = input<TagRow[]>([]);
  readonly loading = input<boolean>(false);

  readonly queryChange = output<QueryOptions>();
  readonly showDetail = output<TagRow>();
  readonly editTag = output<TagRow>();
  readonly deleteTag = output<TagRow>();

  readonly titleColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: TagRow }>>('titleColumn');
  readonly actionsColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: TagRow }>>('actionsColumn');

  readonly ActionsIcon = actionsIconSet.ActionsMenu;

  readonly actionsMenuConfig = computed<ActionsMenuConfig<TagRow, unknown>[]>(() => [
    {
      text: 'Show detail',
      icon: iconSet.TracksIcon,
      onSelected: (tag) => this.showDetail.emit(tag),
    },
    {
      text: 'Edit',
      icon: actionsIconSet.EditIcon,
      onSelected: (tag) => this.editTag.emit(tag),
    },
    {
      text: 'Delete',
      icon: actionsIconSet.DeleteIcon,
      onSelected: (tag) => this.deleteTag.emit(tag),
    },
  ]);

  readonly tableConfig = computed<TableColumnConfiguration<TagRow>>(() => ({
    title: {
      title: 'Name',
      sortable: true,
      isDefaultSortColumn: true,
      template: () => this.titleColumnTemplate()
    },
    trackCount: {
      title: 'Tracks',
      sortable: false,
      width: '120px',
    },
    actions: {
      title: '',
      template: () => this.actionsColumnTemplate(),
      width: '70px',
    },
  }));

  readonly trackByFn: TableTrackByFn<TagRow> = (_index: number, item: TagRow) =>
    item.id;
}
