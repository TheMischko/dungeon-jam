import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { PlaylistGridComponent } from '../playlist-grid.component';
import { Playlist, PlaylistUpdateQuery } from '@shared/models/playlist.model';
import { SortDirection } from '@shared/models/common.model';
import { QueryRequest } from '@shared/models/request.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { Router } from '@angular/router';
import { playlistRouteStrings } from '../../../../playlist-route-strings';
import { PlaybackService } from '../../../../../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, Observable, of, take, tap } from 'rxjs';
import { TrackService } from '../../../../../../services/track.service';
import { TagsStore } from '@general/stores/tags.store';
import { PlaylistWithTagData } from '@general/models/playlist.model';
import { GridPlaylistSizeConfig } from '../../../../../../models/grid-item-size-config.model';
import { ImageApiService } from '@general/services/image-api.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogService } from '../../../../../../services/dialog.service';
import {
  UpdatePlaylistModalComponent,
  UpdatePlaylistModalData,
} from '../../../../modals/update-playlist-modal/update-playlist-modal.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../../../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { PlaylistParentFilterChange } from '../../../../components/playlist-parent-filter/playlist-parent-filter.component';
import { DisplayOrderPlacement } from '@shared/models/display-order.model';

@Component({
  selector: 'app-playlist-grid-smart',
  imports: [PlaylistGridComponent],
  templateUrl: './playlist-grid-smart.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './playlist-grid-smart.component.scss',
})
export class PlaylistGridSmartComponent implements OnInit {
  readonly playlistStore = inject(PlaylistStore);
  readonly tagsStore = inject(TagsStore);
  readonly playbackService = inject(PlaybackService);
  readonly trackService = inject(TrackService);
  readonly router = inject(Router);
  readonly imageApiService = inject(ImageApiService);

  readonly showControls = input<boolean>(true);
  readonly limit = input<number | undefined>(undefined);

  readonly playlistImageMap = signal<Record<string, string | null>>({});
  readonly sizeSliderValue = signal<number>(0.75);
  readonly searchFilter = signal<string>('');
  readonly sortDirection = signal<SortDirection>(SortDirection.ASC);
  readonly sortBy = signal<Extract<keyof Playlist, string>>('order');
  readonly parent = signal<PlaylistParentFilterChange>(null);

  readonly playlists = signal<Playlist[]>([]);
  readonly dataSet = computed<PlaylistWithTagData[]>(() => {
    const loading = this.loading();
    if (loading) {
      return [];
    }
    const tags = untracked(() => this.tagsStore.entityMap());
    const playlists = this.playlists();
    const parent = this.parent();
    return playlists
      .map((playlist) => {
        const playlistTags = playlist.tags
          .map((t) => tags[t])
          .filter((t) => !!t);
        return {
          ...playlist,
          tags: playlistTags,
        };
      })
      .filter((playlist) => {
        if (!parent) {
          return true;
        }
        if (parent === 'no-parent') {
          return !playlist.ownershipId;
        }
        return playlist.ownershipId === parent;
      })
      .slice(0, this.limit() ?? playlists.length);
  });

  readonly loading = computed<boolean>(() => {
    return this.playlistStore.loading() || this.tagsStore.loading();
  });
  readonly sizeConfig = computed<GridPlaylistSizeConfig>(() => {
    const sliderVal = this.sizeSliderValue();
    return getSizeConfig(sliderVal);
  });
  readonly queryOptions = computed<QueryRequest>(() => ({
    search: this.searchFilter(),
  }));
  readonly showParentsFilter = computed<boolean>(() => {
    return this.playlistStore.allParents().length > 0;
  });
  readonly playingPlaylistId = toSignal(
    this.playbackService.playback$.pipe(
      map((state) => (state.isPlaying ? state.playlistId : undefined))
    )
  );

  constructor() {
    effect(() => {
      const playlists = this.playlistStore.entities();
      this.playlists.set(playlists);
      if (!playlists?.length) {
        return;
      }
      const sub = this.updateImageMap(playlists).subscribe();

      return () => {
        sub?.unsubscribe();
      };
    });
  }

  ngOnInit() {
    this.playlistStore.load(this.queryOptions);
  }

  handleSizeChange(newSize: number) {
    if (newSize > 100 || newSize < 0) {
      return;
    }
    this.sizeSliderValue.set(newSize);
  }

  playPlaylist(playlistId: string) {
    this.trackService
      .getTracksByPlaylist({
        playlistId,
        sortBy: 'name',
        sortDirection: SortDirection.ASC,
      })
      .pipe(take(1))
      .subscribe(async (tracks) => {
        if (!tracks?.length) {
          return;
        }
        await this.playbackService.playTracks(tracks, { playlistId });
      });
  }

  pausePlaylist() {
    this.playbackService.pause();
  }

  async showPlaylistDetails(playlistId: string) {
    await this.router.navigate([
      playlistRouteStrings.playlists,
      playlistRouteStrings.detail,
      playlistId,
    ]);
  }

  private updateImageMap(playlists: Playlist[]): Observable<void> {
    const imageRequests = playlists.map((p) => {
      if (p.imageUrl) {
        return this.imageApiService.fetchImage(p.imageUrl).pipe(
          map((imageUrl) => ({
            playlistId: p.id,
            imageUrl,
          }))
        );
      }
      return of({
        playlistId: p.id,
        imageUrl: null,
      });
    });

    return forkJoin(imageRequests).pipe(
      tap((responses) => {
        const imageMap = responses.reduce(
          (map, response) => {
            return {
              ...map,
              [response.playlistId]: response.imageUrl,
            };
          },
          {} as Record<string, string | null>
        );
        this.playlistImageMap.set(imageMap);
      }),
      map(() => void 0)
    );
  }

  protected reorderPlaylist(event: CdkDragDrop<PlaylistWithTagData[]>) {
    const dataSet = this.dataSet();
    const item = dataSet[event.previousIndex];
    if (!item) {
      return;
    }

    const anchor = dataSet[event.currentIndex];
    const placement =
      event.currentIndex > event.previousIndex
        ? DisplayOrderPlacement.AFTER
        : DisplayOrderPlacement.BEFORE;
    const parent = this.parent();
    this.playlistStore.changeRelativeOrder({
      playlistId: item.id,
      anchorId: anchor?.id,
      placement,
      parentId: parent !== null && parent !== 'no-parent' ? parent : undefined,
    });

    this.playlists.update((playlists) => {
      const update = [...playlists];
      const fromIndex = update.findIndex((p) => p.id === item.id);
      if (fromIndex === -1) {
        return update;
      }

      let toIndex: number;
      if (!anchor) {
        toIndex =
          placement === DisplayOrderPlacement.BEFORE ? 0 : update.length - 1;
      } else {
        const anchorIndex = update.findIndex((p) => p.id === anchor.id);
        if (anchorIndex === -1) {
          return update;
        }
        toIndex = anchorIndex;
      }

      moveItemInArray(update, fromIndex, toIndex);
      return update;
    });
  }

  readonly dialogService = inject(DialogService);

  protected openEditModal(playlistItem: PlaylistWithTagData) {
    const playlist = this.playlistStore.entityMap()[playlistItem.id];
    if (!playlist) {
      return;
    }
    const parentPlaylist = this.playlistStore.getParent(playlist.id);
    const dialogRef = this.dialogService.open<
      UpdatePlaylistModalComponent,
      PlaylistUpdateQuery
    >(UpdatePlaylistModalComponent, {
      data: {
        playlist,
        parentPlaylistId: parentPlaylist ?? undefined,
      } as UpdatePlaylistModalData,
    });

    dialogRef.afterClosed$.subscribe((result) => {
      if (!result) {
        return;
      }
      this.playlistStore.updatePlaylist(result);
    });
  }

  protected deletePlaylist(playlist: PlaylistWithTagData) {
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
    });
  }

  protected updateParent(parent: PlaylistParentFilterChange) {
    this.parent.set(parent);
  }
}

function getSizeConfig(sliderVal: number): GridPlaylistSizeConfig {
  if (sliderVal <= 0.25) {
    return {
      imageSize: 100,
      titleSize: 12,
      hideTracks: true,
      showTags: false,
      titleBold: false,
    };
  }

  if (sliderVal <= 0.5 && sliderVal > 0.25) {
    return {
      imageSize: 150,
      titleSize: 14,
      trackCountSize: 14,
      hideTracks: true,
      showTags: false,
      titleBold: true,
    };
  }

  if (sliderVal <= 0.75 && sliderVal > 0.5) {
    return {
      imageSize: 175,
      titleSize: 16,
      trackCountSize: 16,
      showTags: true,
      hideTracks: false,
      titleBold: true,
    };
  }

  return {
    imageSize: 250,
    titleSize: 18,
    trackCountSize: 18,
    showTags: true,
    hideTracks: false,
    titleBold: true,
  };
}
