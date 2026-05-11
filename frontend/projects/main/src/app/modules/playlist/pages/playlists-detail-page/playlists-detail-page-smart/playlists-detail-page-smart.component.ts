import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import { PlaylistTracksQuery, Track } from '@shared/models/track.model';
import { PlaylistTracksStore } from '../../../../../stores/playlist-tracks.store';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Playlist, PlaylistUpdateQuery } from '@shared/models/playlist.model';
import { PlaylistsDetailPageComponent } from '../playlists-detail-page.component';
import { PlaybackService } from '../../../../../services/playback.service';
import { PlaybackState } from '../../../../../models/playback.model';
import { ActionsMenuConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { actionsIconSet } from '@general/icons/icons';
import { DialogService } from '../../../../../services/dialog.service';
import {
  SelectLibraryTracksModalComponent,
  SelectLibraryTracksModalConfig,
} from '../../../../library/modals/select-library-tracks-modal/select-library-tracks-modal.component';
import { SelectLibraryTracksSelection } from '../../../../library/modals/select-library-tracks-modal/select-library-tracks-modal.types';
import { ToastService } from '../../../../../services/toast.service';
import { ToastType } from '../../../../../models/toast.model';
import { QueryOptions } from '@shared/models/request.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { DefaultTrackActionsService } from '../../../../../services/default-track-actions.service';
import {
  UpdatePlaylistModalComponent,
  UpdatePlaylistModalData,
} from '../../../modals/update-playlist-modal/update-playlist-modal.component';
import { ImageApiService } from '@general/services/image-api.service';
import { FilterQuery } from '@shared/models/filter.model';
import {
  DiscoverTracksModalComponent,
  DiscoverTracksModalData,
} from '../../../../library/modals/discover-tracks-modal/discover-tracks-modal.component';

@Component({
  selector: 'app-playlists-detail-page-smart',
  imports: [PlaylistsDetailPageComponent],
  templateUrl: './playlists-detail-page-smart.component.html',
})
export class PlaylistsDetailPageSmartComponent implements OnInit {
  readonly playlistTracksStore = inject(PlaylistTracksStore);
  readonly playlistService = inject(PlaylistApiService);
  readonly playbackService = inject(PlaybackService);
  readonly dialogService = inject(DialogService);
  readonly toastService = inject(ToastService);
  readonly playlistStore = inject(PlaylistStore);
  readonly defaultActionsService = inject(DefaultTrackActionsService);
  readonly imageApiService = inject(ImageApiService);
  readonly destroyRef = inject(DestroyRef);

  readonly playlistId = input<string>('', { alias: 'id' });

  readonly tracks = this.playlistTracksStore.entities;

  readonly playlist = computed(() => {
    const playlistId = this.playlistId();
    if (!playlistId) {
      return null;
    }
    return this.playlistStore.entityMap()[playlistId] ?? null;
  });

  readonly parentPlaylist = computed(() => {
    const playlistId = this.playlistId();
    return this.playlistStore.getParent(playlistId);
  });

  readonly childPlaylists = computed(() => {
    const childIds = this.playlist()?.childrenIds;
    if (!childIds) {
      return [];
    }
    const playlistMap = this.playlistStore.entityMap();
    return childIds.map((id) => playlistMap[id]).filter((p: Playlist) => !!p);
  });

  readonly playbackState = toSignal<PlaybackState | null>(
    this.playbackService.playback$,
    { initialValue: null }
  );
  readonly isPlaylistPlaying = computed<boolean>(() => {
    const playbackState = this.playbackState();
    return (
      (playbackState?.isPlaying &&
        playbackState.playlistId === this.playlistId()) ??
      false
    );
  });
  readonly playlistImageUrl = signal<string | null>(null);
  readonly currentFilter = signal<string>('');
  readonly currentSortBy = signal<string>('name');
  readonly currentSortDirection = signal<SortDirection>(SortDirection.ASC);
  readonly currentIncludeChildren = signal<boolean>(false);
  readonly currentFilters = signal<FilterQuery>(new FilterQuery());

  readonly loadQuery = computed<PlaylistTracksQuery>(() => ({
    search: this.currentFilter(),
    sortDirection: this.currentSortDirection(),
    sortBy: this.currentSortBy(),
    playlistId: this.playlistId(),
    filters: this.currentFilters(),
    includeChildren: this.currentIncludeChildren(),
  }));
  songActionsMenuConfig = computed<ActionsMenuConfig<Track, Playlist>[]>(() => {
    return this.defaultActionsService.createActions({
      appendActions: [
        {
          text: 'Remove from playlist',
          icon: actionsIconSet.DeleteIcon,
          onSelected: (track: Track) => {
            this.removeTrackFromPlaylist(track);
          },
        },
      ],
      excludeActions: ['delete'],
    });
  });

  constructor() {
    effect(() => {
      const playlist = this.playlist();
      if (!playlist || !playlist.imageUrl) {
        return;
      }
      const sub = this.imageApiService
        .fetchImage(playlist.imageUrl)
        .subscribe((image) => {
          this.playlistImageUrl.set(image);
        });
      return () => {
        sub?.unsubscribe();
      };
    });
  }

  ngOnInit() {
    this.playlistTracksStore.load(this.loadQuery);
    this.playlistStore.load({});
    this.defaultActionsService.afterEditTrack$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.playlistTracksStore.load(this.loadQuery());
      });
  }

  async playPlaylist() {
    const tracks = this.tracks();
    await this.playbackService.playTracks(tracks, this.playlistId());
  }

  openAddTracksModal() {
    const dialogRef = this.dialogService.open<
      SelectLibraryTracksModalComponent,
      SelectLibraryTracksSelection
    >(SelectLibraryTracksModalComponent, {
      data: {
        excludedTrackIds: this.tracks().map((track) => track.id),
      },
    } as SelectLibraryTracksModalConfig);

    dialogRef.afterClosed$.subscribe(
      (result: SelectLibraryTracksSelection | undefined) => {
        if (result?.selectedTracks && result.selectedTracks.length > 0) {
          this.addTracksToPlaylist(result.selectedTracks);
        }
      }
    );
  }

  openEditPlaylistModal() {
    const dialogRef = this.dialogService.open<
      UpdatePlaylistModalComponent,
      PlaylistUpdateQuery
    >(UpdatePlaylistModalComponent, {
      data: {
        playlist: this.playlist(),
        parentPlaylist: this.parentPlaylist() ?? undefined,
      } as UpdatePlaylistModalData,
    });

    dialogRef.afterClosed$.subscribe((result) => {
      if (!result) {
        return;
      }
      this.playlistStore.updatePlaylist(result);
    });
  }

  private addTracksToPlaylist(tracks: Track[]): void {
    const tracksToAdd = this.filterAlreadyIncludedTracks(tracks);
    if (tracksToAdd.length === 0) {
      return;
    }
    this.playlistService
      .addTracks({
        [this.playlistId()]: tracksToAdd.map((track) => track.id),
      })
      .subscribe({
        next: () => {
          this.playlistTracksStore.load(this.loadQuery);
          this.playlistStore.load({});
        },
        error: (err) => {
          this.toastService.createToast(
            'Assignment failed',
            err.toString(),
            ToastType.Error
          );
        },
      });
  }

  async playTrack(track: Track) {
    const tracks = this.tracks();
    const trackIndex = tracks.indexOf(track);
    if (trackIndex < 0) {
      return;
    }
    await this.playbackService.play(
      tracks[trackIndex],
      [...tracks.slice(trackIndex + 1), ...tracks.slice(0, trackIndex)],
      this.playlistId()
    );
  }

  async pausePlaying() {
    this.playbackService.pause();
  }

  private removeTrackFromPlaylist(track: Track) {
    this.playlistTracksStore.removeTrackFromPlaylist({
      playlistId: this.playlistId(),
      trackId: track.id,
    });
  }

  private filterAlreadyIncludedTracks(tracks: Track[]) {
    const currentTrackIds = new Set(this.tracks().map((track) => track.id));
    return tracks.filter(
      (track) => track?.id && !currentTrackIds.has(track.id)
    );
  }

  protected updateQuery(queryOptions: QueryOptions) {
    if (queryOptions.search) {
      this.currentFilter.set(queryOptions.search);
    }
    if (queryOptions.sortBy) {
      this.currentSortBy.set(queryOptions.sortBy);
    }
    if (queryOptions.sortDirection) {
      this.currentSortDirection.set(queryOptions.sortDirection);
    }
    if (queryOptions.filters) {
      this.currentFilters.set(queryOptions.filters);
    }
  }

  protected updateIncludeChildren(include: boolean) {
    this.currentIncludeChildren.set(include);
  }

  protected openDiscoverModal() {
    const dialog = this.dialogService.open<
      DiscoverTracksModalComponent,
      { selectedTracks: Track[]; again: boolean }
    >(DiscoverTracksModalComponent, {
      data: {
        playlist: this.playlist(),
      } as DiscoverTracksModalData,
    });

    dialog.afterClosed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (result: { selectedTracks: Track[]; again: boolean } | undefined) => {
          const triggerRepeat = result?.again
            ? () => setTimeout(() => this.openDiscoverModal(), 1000)
            : () => {};
          if (!result || result.selectedTracks.length === 0) {
            return triggerRepeat();
          }
          this.addTracksToPlaylist(result.selectedTracks);
          return triggerRepeat();
        }
      );
  }
}
