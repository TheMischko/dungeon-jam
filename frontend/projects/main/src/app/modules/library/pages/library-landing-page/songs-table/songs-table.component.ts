import {
  Component,
  computed,
  inject,
  input,
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
export class SongsTableComponent implements OnInit {
  readonly playlistsStore = inject(PlaylistStore);
  readonly durationPipe = new TrackDurationPipe();

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

  readonly activeRow = signal<Track | null>(null);

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

  readonly displayedColumns = computed<string[]>(() => {
    const columns = ['play', 'title', 'author', 'duration', 'tags'];
    if (this.actionsMenuConfig().length) {
      columns.push('actions');
    }
    return columns;
  });

  ngOnInit() {
    this.playlistsStore.load({
      sortBy: 'title',
      sortDirection: SortDirection.ASC,
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
}
