import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  ViewContainerRef,
} from '@angular/core';
import { SortDirection } from '@shared/models/common.model';
import {
  AudioTrack,
  PlaylistTracksQuery,
  Track,
} from '@shared/models/track.model';
import { PlaylistTracksStore } from '../../../../../stores/playlist-tracks.store';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Playlist, PlaylistUpdateQuery } from '@shared/models/playlist.model';
import { PlaylistWithTagData } from '@general/models/playlist.model';
import { PlaylistsDetailPageComponent } from '../playlists-detail-page.component';
import { PlaybackService } from '../../../../../services/playback.service';
import { PlaybackState } from '../../../../../models/playback.model';
import {
  ActionsMenuConfig,
  ActionsMenuDataConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { actionsIconSet } from '@general/icons/icons';
import { DialogService } from '../../../../../services/dialog.service';
import {
  SelectLibraryTracksModalComponent,
  SelectLibraryTracksModalConfig,
} from '../../../../library/modals/select-library-tracks-modal/select-library-tracks-modal.component';
import { SelectLibraryTracksSelection } from '../../../../library/modals/select-library-tracks-modal/select-library-tracks-modal.types';
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
  DiscoverTracksModalResult,
} from '../../../../library/modals/discover-tracks-modal/discover-tracks-modal.component';
import { ToastType } from '@general/models/toast.model';
import { ToastService } from '@general/services/toast.service';
import { NewTrackDropInService } from '../../../../library/services/new-track-drop-in.service';
import { PlaylistToastService } from '@general/services/toast/playlist-toast.service';
import { TagsStore } from '@general/stores/tags.store';
import { Router } from '@angular/router';
import { playlistRouteStrings } from '../../../playlist-route-strings';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { DiscoverTracksStateService } from '../../../../../services/discover-tracks-state.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DisplayOrderPlacement } from '@shared/models/display-order.model';
import { MenuCloseReason } from '@angular/material/menu';
import { forkJoin, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-playlists-detail-page-smart',
  imports: [PlaylistsDetailPageComponent],
  providers: [DiscoverTracksStateService],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  private readonly router = inject(Router);
  private readonly newTrackDropInService = inject(NewTrackDropInService);
  private readonly playlistToastService = inject(PlaylistToastService);
  private readonly tagsStore = inject(TagsStore);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly discoverStateService = inject(DiscoverTracksStateService);

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
    const orderMap = this.playlistStore.latestOrderMap();
    const children = childIds
      .map((id) => playlistMap[id])
      .filter((p: Playlist) => !!p);
    return [...children].sort((a, b) => {
      const orderA = orderMap.get(a.id)?.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.id)?.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
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
  readonly currentFilter = signal<string | undefined>(undefined);
  readonly currentSortBy = signal<string | undefined>('name');
  readonly currentSortDirection = signal<SortDirection | undefined>(
    SortDirection.ASC
  );
  readonly currentIncludeChildren = signal<boolean>(false);
  readonly currentFilters = signal<FilterQuery>(new FilterQuery());
  readonly showMoveToChild = signal<boolean>(false);
  protected readonly childPlaylistImageMap = signal<
    Record<string, string | null>
  >({});

  readonly loadQuery = computed<PlaylistTracksQuery>(() => ({
    search: this.currentFilter(),
    sortDirection: this.currentSortDirection(),
    sortBy: this.currentSortBy(),
    playlistId: this.playlistId(),
    filters: this.currentFilters(),
    includeChildren: this.currentIncludeChildren(),
  }));

  readonly moveToChildActions = computed<
    ActionsMenuDataConfig<Track, Playlist>[]
  >(() => {
    return this.childPlaylists().map((child) => ({
      text: child.name,
      data: child,
      keepOpen: false,
      onSelected: (
        track: Track,
        config: ActionsMenuDataConfig<Track, Playlist>
      ) => {
        this.moveTrackToChildPlaylist(track, config.data!);
      },
    }));
  });

  readonly defaultSongActionsMenuConfig = computed<
    ActionsMenuConfig<Track, Playlist>[]
  >(() => {
    const hasChildren = this.childPlaylists().length > 0;
    return this.defaultActionsService.createActions({
      appendActions: [
        ...(hasChildren
          ? [
              {
                text: 'Move to child playlist',
                icon: actionsIconSet.AddIcon,
                onSelected: () => this.showMoveToChild.set(true),
                keepOpen: true,
              },
            ]
          : []),
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

  songActionsMenuConfig = computed<ActionsMenuConfig<Track, Playlist>[]>(() => {
    if (this.showMoveToChild()) {
      return this.moveToChildActions();
    }
    return this.defaultSongActionsMenuConfig();
  });

  constructor() {
    effect(() => {
      const playlist = this.playlist();
      if (!playlist || !playlist.imageUrl) {
        this.playlistImageUrl.set(null);
        return;
      }
      const sub = this.imageApiService
        .fetchImage(playlist.imageUrl)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((image) => {
          this.playlistImageUrl.set(image);
        });
      return () => {
        sub?.unsubscribe();
      };
    });

    effect(() => {
      this.playlistId();
      this.discoverStateService.reset();
    });

    effect(() => {
      const playlistId = this.playlistId();
      // Track childrenIds length so order map refreshes when children are added/removed
      this.playlist()?.childrenIds?.length;
      if (!playlistId) {
        return;
      }
      this.playlistStore.updateOrderMap(playlistId);
    });

    effect(() => {
      const children = this.childPlaylists();
      if (!children.length) {
        this.childPlaylistImageMap.set({});
        return;
      }
      const sub = this.updateChildPlaylistImageMap(children).subscribe();
      return () => {
        sub?.unsubscribe();
      };
    });
  }

  private updateChildPlaylistImageMap(playlists: Playlist[]): Observable<void> {
    const imageRequests = playlists.map((playlist) => {
      if (playlist.imageUrl) {
        return this.imageApiService
          .fetchImage(playlist.imageUrl)
          .pipe(map((imageUrl) => ({ playlistId: playlist.id, imageUrl })));
      }
      return of({ playlistId: playlist.id, imageUrl: null });
    });
    return forkJoin(imageRequests).pipe(
      tap((responses) => {
        const imageMap = responses.reduce(
          (map, response) => ({
            ...map,
            [response.playlistId]: response.imageUrl,
          }),
          {} as Record<string, string | null>
        );
        this.childPlaylistImageMap.set(imageMap);
      }),
      map(() => void 0)
    );
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
    await this.playbackService.playTracks(tracks, {
      playlistId: this.playlistId(),
    });
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
        parentPlaylistId: this.parentPlaylist() ?? undefined,
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

  onTracksDropped(audioTracks: AudioTrack[]): void {
    this.newTrackDropInService
      .startUploadSequence(audioTracks)
      .subscribe((uploadedTracks) => {
        this.addTracksToPlaylist(uploadedTracks);
        this.playlistToastService.showTracksAddedSuccess();
        this.tagsStore.loadAll();
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
      { playlistId: this.playlistId() }
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
    this.currentFilter.set(queryOptions.search);
    this.currentSortBy.set(queryOptions.sortBy);
    this.currentSortDirection.set(queryOptions.sortDirection);
    if (queryOptions.filters) {
      this.currentFilters.set(queryOptions.filters);
    }
  }

  protected updateIncludeChildren(include: boolean) {
    this.currentIncludeChildren.set(include);
  }

  openDeletePlaylistModal(): void {
    const playlist = this.playlist();
    if (!playlist) {
      return;
    }
    const dialogRef = this.dialogService.open<
      ConfirmationDialogComponent,
      boolean
    >(ConfirmationDialogComponent, {
      data: {
        title: 'Delete playlist',
        message: `Are you sure you want to delete playlist "${playlist.name}"?`,
        confirmText: 'Delete',
        dismissText: 'Cancel',
      } satisfies ConfirmationDialogData,
    });

    dialogRef.afterClosed$.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.playlistStore.deletePlaylist(playlist.id);
      this.router.navigate([`/${playlistRouteStrings.playlists}`]);
    });
  }

  protected openDiscoverModal() {
    const dialog = this.dialogService.open<
      DiscoverTracksModalComponent,
      DiscoverTracksModalResult
    >(DiscoverTracksModalComponent, {
      viewContainerRef: this.viewContainerRef,
      data: {
        playlist: this.playlist(),
      } as DiscoverTracksModalData,
    });

    dialog.afterClosed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.selectedTracks?.length) {
          this.addTracksToPlaylist(result.selectedTracks);
        }
        if (result?.again) {
          this.openDiscoverModal();
        }
      });
  }

  protected reorderChildPlaylist(event: CdkDragDrop<PlaylistWithTagData[]>) {
    const children = this.childPlaylists();
    const item = children[event.previousIndex];
    if (!item) {
      return;
    }
    const anchor = children[event.currentIndex];
    const placement =
      event.currentIndex > event.previousIndex
        ? DisplayOrderPlacement.AFTER
        : DisplayOrderPlacement.BEFORE;
    this.playlistStore.changeRelativeOrder({
      playlistId: item.id,
      anchorId: anchor?.id,
      placement,
      parentId: this.playlistId(),
    });
  }

  protected actionsClosed(reason: MenuCloseReason | string) {
    if (reason !== 'click' || this.showMoveToChild()) {
      setTimeout(() => {
        this.showMoveToChild.set(false);
      }, 250);
    }
  }

  private moveTrackToChildPlaylist(track: Track, child: Playlist) {
    this.playlistStore.addNewTracks({
      [child.id]: [track.id],
    });
    this.removeTrackFromPlaylist(track);
    this.showMoveToChild.set(false);
  }
}
