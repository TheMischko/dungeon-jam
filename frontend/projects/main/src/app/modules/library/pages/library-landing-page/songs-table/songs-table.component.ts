import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ChangeDetectionStrategy,
  inject,
  untracked,
  DestroyRef,
} from '@angular/core';
import { Track } from '@shared/models/track.model';
import { LucideDynamicIcon } from '@lucide/angular';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { MatIconButton } from '@angular/material/button';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import {
  MatMenu,
  MatMenuTrigger,
  MenuCloseReason,
} from '@angular/material/menu';
import {
  ActionsMenuComponent,
  ActionsMenuConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { Playlist } from '@shared/models/playlist.model';
import { TagListSmartComponent } from '@general/components/display/tag-list/tag-list-smart/tag-list-smart.component';
import {
  TableColumnConfiguration,
  TableTrackByFn,
  TableUniquenessFn,
} from '../../../../../models/table.model';
import { SmartTableComponent } from '../../../../../components/table/smart-table/smart-table.component';
import { QueryOptions } from '@shared/models/request.model';
import { SignalPaginationService } from '@general/services/signal-pagination.service';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION_PAGES,
  PaginationConfig,
} from '../../../../../models/pagination.model';
import { PageEvent } from '@angular/material/paginator';
import { TrackHighlightService } from '../../../../../services/track-highlight.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrackHighlightContext } from '../../../../../models/track-highlight.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-songs-table',
  imports: [
    LucideDynamicIcon,
    MatIconButton,
    IconButtonComponent,
    MatMenuTrigger,
    MatMenu,
    ActionsMenuComponent,
    TagListSmartComponent,
    SmartTableComponent,
  ],
  templateUrl: './songs-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './songs-table.component.scss',
})
export class SongsTableComponent {
  readonly trackHighlightService = inject(TrackHighlightService);
  readonly destroyRef = inject(DestroyRef);
  readonly paginationService!: SignalPaginationService<Track>;

  readonly tracks = input<Track[]>([]);
  readonly playingTrackId = input<string | null>();
  readonly actionsMenuConfig = input<ActionsMenuConfig<Track, Playlist>[]>([]);
  readonly selection = input<boolean>(false);
  readonly allSelectedState = input<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly loading = input<boolean>(false);
  readonly showActionsColumn = input<boolean>(true);
  readonly showControls = input<boolean>(true);
  readonly showFilters = input<boolean>(true);
  readonly showPlayWithSelection = input<boolean>(false);
  readonly hiddenColumns = input<(keyof Track)[]>([]);
  readonly paginationPages = input<number[] | undefined>(undefined);
  readonly initialPageSize = input<number>(DEFAULT_PAGE_SIZE);
  readonly initialQuery = input<QueryOptions>({});
  readonly noDataText = input<string>(
    'Oops, there are no tracks yet. You need to upload some!'
  );
  readonly noSearchResultsText = input<string>(
    'No tracks match your search query.'
  );

  readonly queryChange = output<QueryOptions>();
  readonly playTrack = output<Track>();
  readonly pauseTrack = output();
  readonly actionMenuClosed = output<MenuCloseReason | string>();
  readonly selectionChange = output<Track[]>();
  readonly pageSizeChange = output<number>();

  readonly highlightContext = input<TrackHighlightContext>();
  readonly highlightTrackId = signal<string | undefined>(undefined);

  readonly playColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('playColumn');
  readonly tagsColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('tagColumn');
  readonly actionsColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('actionsColumn');

  readonly durationPipe = new TrackDurationPipe();
  readonly trackByTrackId: TableTrackByFn<Track> = (_: number, item: Track) =>
    item.id;
  readonly uniqueTrackFn: TableUniquenessFn<Track> = (a: Track, b: Track) =>
    a.id === b.id;

  readonly activeRow = signal<Track | null>(null);
  readonly currentSearchValue = signal<string>('');
  readonly paginatedTracks = computed(
    () => this.paginationService?.currentPageData() ?? []
  );

  readonly paginationConfig = computed<PaginationConfig>(() => ({
    pageSizeOptions: this.paginationPages() ?? DEFAULT_PAGINATION_PAGES,
    pageSize: this.paginationService?.pageSize(),
    totalItems: this.paginationService?.totalItems() ?? 0,
    currentPageIndex: this.paginationService?.currentPageIndex() ?? 0,
  }));

  readonly shouldShowPlayCol = computed<boolean>(() => {
    const selection = this.selection();
    const showPlay = this.showPlayWithSelection();
    return !(selection && !showPlay);
  });

  readonly tableConfig = computed<TableColumnConfiguration<Track>>(() => ({
    ...(this.shouldShowPlayCol() && {
      play: {
        title: '',
        template: () => this.playColumnTemplate(),
        width: '65px',
      },
    }),
    name: {
      title: 'Title',
      sortable: true,
    },
    author: {
      title: 'Author',
      sortable: true,
      canCollapse: true,
    },
    duration: {
      title: 'Duration',
      customValueFn: (track: Track) =>
        this.durationPipe.transform(track.duration),
      width: '90px',
      canCollapse: true,
    },
    tags: {
      title: 'Tags',
      template: () => this.tagsColumnTemplate(),
      canCollapse: true,
    },
    ...(this.showActionsColumn() && {
      actions: {
        title: '',
        template: () => this.actionsColumnTemplate(),
        width: '70px',
      },
    }),
  }));

  private trackHighlightSubscription?: Subscription;

  constructor() {
    this.paginationService = SignalPaginationService.create(this.tracks);
    effect(() => {
      const pageSize = this.initialPageSize();
      this.paginationService.pageSize.set(pageSize);
    });

    effect(() => {
      if (this.loading()) {
        this.paginationService.resetPage();
      }
    });

    effect(() => {
      this.trackHighlightSubscription?.unsubscribe();
      const trackHighlightContext = this.highlightContext();
      if (!trackHighlightContext) {
        this.highlightTrackId.set(undefined);
        return;
      }
      this.trackHighlightSubscription = this.trackHighlightService
        .listenForHighlightedTrack(trackHighlightContext)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((trackId) => {
          this.highlightTrackId.set(trackId);
        });
    });

    effect(() => {
      const highlightTrackId = this.highlightTrackId();
      if (!highlightTrackId || this.tracks().length === 0 || this.loading()) {
        return;
      }
      untracked(() => this.findTrackWithId(highlightTrackId));
    });
  }

  hoverStart(track: Track) {
    this.activeRow.set(track);
  }

  hoverEnd(track: Track) {
    if (this.activeRow()?.id === track.id) {
      this.activeRow.set(null);
    }
  }

  isActiveRow(track: Track): boolean {
    return this.activeRow()?.id === track.id;
  }

  isTrackPlaying(track: Track) {
    if (!this.playingTrackId()) {
      return false;
    }
    return this.playingTrackId() === track.id;
  }

  play(track: Track) {
    this.playTrack.emit(track);
  }

  pause() {
    this.pauseTrack.emit();
  }

  readonly PlayIcon = iconSet.PlayIcon;
  readonly PauseIcon = iconSet.PauseIcon;
  readonly ActionsIcon = actionsIconSet.ActionsMenu;

  updateSelection(selectedTracks: Track[]) {
    this.selectionChange.emit(selectedTracks);
  }

  protected updateQuery(query: QueryOptions) {
    this.currentSearchValue.set(query?.search?.trim() ?? '');
    this.queryChange.emit(query);
  }

  protected updatePaginationState(event: PageEvent) {
    this.paginationService.pageSize.set(event.pageSize);
    this.paginationService.goToPage(event.pageIndex);
    this.pageSizeChange.emit(event.pageSize);
  }

  private findTrackWithId(highlightTrackId: string) {
    const tracks = this.tracks();
    const trackIndex = tracks.findIndex(
      (track: Track) => track.id === highlightTrackId
    );
    if (trackIndex >= 0) {
      const pageSize = this.paginationService.pageSize();
      const targetPage = Math.floor(trackIndex / pageSize);
      this.paginationService.goToPage(targetPage);
    }
    this.trackHighlightService.resetHighlightTrackId();
  }
}
