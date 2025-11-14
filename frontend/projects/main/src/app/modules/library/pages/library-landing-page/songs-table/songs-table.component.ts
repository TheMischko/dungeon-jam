import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Track } from '@shared/models/track.model';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { MatIconButton } from '@angular/material/button';
import { TrackDurationPipe } from '@general/pipes/track-duration.pipe';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
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
import { PlaylistStore } from '@general/stores/playlist.store';
import { Playlist } from '@shared/models/playlist.model';
import { SortDirection } from '@shared/models/common.model';
import { TagListSmartComponent } from '@general/components/display/tag-list/tag-list-smart/tag-list-smart.component';
import { TableColumnConfiguration } from '../../../../../models/table.model';
import { TableComponent } from '../../../../../components/table/table.component';

@Component({
  selector: 'app-songs-table',
  imports: [
    LucideAngularModule,
    MatIconButton,
    SearchBarComponent,
    IconButtonComponent,
    MatMenuTrigger,
    MatMenu,
    ActionsMenuComponent,
    TagListSmartComponent,
    TableComponent,
  ],
  templateUrl: './songs-table.component.html',
  styleUrl: './songs-table.component.scss',
})
export class SongsTableComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly playlistsStore = inject(PlaylistStore);
  readonly componentElement = inject(ElementRef<HTMLElement>);

  readonly tracks = input<Track[]>([]);
  readonly playingTrackId = input<string | null>();
  readonly actionsMenuConfig = input<ActionsMenuConfig<Track, Playlist>[]>([]);

  readonly playTrack = output<Track>();
  readonly pauseTrack = output();
  readonly search = output<string>();
  readonly actionMenuClosed = output<MenuCloseReason>();

  readonly playColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('playColumn');
  readonly tagsColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('tagColumn');
  readonly actionsColumnTemplate =
    viewChild.required<TemplateRef<{ $implicit: Track }>>('actionsColumn');

  readonly durationPipe = new TrackDurationPipe();
  private resizeObserver!: ResizeObserver;

  readonly activeRow = signal<Track | null>(null);
  readonly componentWidth = signal<number>(0);

  readonly maxTagsToShow = computed(() => {
    const width = this.componentWidth();
    switch (true) {
      case width > 1100:
        return 4;
      case width > 950:
        return 3;
      case width > 800:
        return 2;
      case width > 450:
        return 1;
      default:
        return 0;
    }
  });

  readonly tableConfig: TableColumnConfiguration<Track> = {
    play: {
      title: '',
      template: () => this.playColumnTemplate(),
      width: '70px',
    },
    name: {
      title: 'Title',
    },
    author: {
      title: 'Author',
    },
    duration: {
      title: 'Duration',
      customValueFn: (track: Track) =>
        this.durationPipe.transform(track.duration),
      width: '90px',
    },
    tags: {
      title: 'Tags',
      template: () => this.tagsColumnTemplate(),
    },
    actions: {
      title: '',
      template: () => this.actionsColumnTemplate(),
      width: '70px',
    },
  };

  ngOnInit() {
    this.playlistsStore.load({
      sortBy: 'title',
      sortDirection: SortDirection.ASC,
    });
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver((_) => {
      this.componentWidth.set(this.componentElement.nativeElement.clientWidth);
    });
    this.resizeObserver.observe(this.componentElement.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
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
}
