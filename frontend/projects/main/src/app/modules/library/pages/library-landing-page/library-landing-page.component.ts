import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SongsDropInZoneComponent } from './songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack, Track } from '@shared/models/track.model';
import { SongsTableComponent } from './songs-table/songs-table.component';
import { PlaybackService } from '../../../../services/playback.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  initialPlaybackState,
  PlaybackState,
} from '../../../../models/playback.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import {
  ActionsMenuBaseConfig,
  ActionsMenuConfig,
  ActionsMenuDataConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { Playlist } from '@shared/models/playlist.model';
import { MenuCloseReason } from '@angular/material/menu';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { TrackLibraryStore } from '../../../../stores/track-library.store';
import {
  EditTrackModalComponent,
  EditTrackResult,
} from '../../modals/edit-track-modal/edit-track-modal.component';
import { take } from 'rxjs';
import { NewTrackDropInService } from '../../services/new-track-drop-in.service';
import { DialogService } from '../../../../services/dialog.service';
import { DefaultTrackActionsService } from '../../../../services/default-track-actions.service';

@Component({
  selector: 'app-library-landing-page',
  imports: [SongsDropInZoneComponent, SongsTableComponent],
  templateUrl: './library-landing-page.component.html',
  styleUrl: './library-landing-page.component.scss',
})
export class LibraryLandingPageComponent implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly trackStore = inject(TrackLibraryStore);
  private readonly playbackService = inject(PlaybackService);
  private readonly newTrackDropInService = inject(NewTrackDropInService);
  private readonly playlistsStore = inject(PlaylistStore);
  private readonly defaultTrackActionsService = inject(
    DefaultTrackActionsService
  );

  readonly tracks = this.trackStore.entities;
  readonly tracksLoading = this.trackStore.loading;

  readonly playbackState = toSignal(this.playbackService.playback$, {
    initialValue: initialPlaybackState,
  });

  readonly playingTrackId = computed(() => {
    const state: PlaybackState = this.playbackState();
    if (state.isPlaying && state.currentTrack) {
      return state.currentTrack.id;
    }
    return null;
  });

  readonly displayTracks = computed<Track[]>(() => {
    return this.tracks();
  });

  readonly menuPickActions = computed(() => {
    return this.playlistsStore
      .entities()
      .map<ActionsMenuDataConfig<Track, Playlist>>((playlist) => {
        return {
          text: playlist.name,
          data: playlist,
          keepOpen: false,
          onSelected: (
            track: Track,
            config: ActionsMenuDataConfig<Track, Playlist>
          ) => {
            this.playlistsStore.addNewTracks({
              [config.data!.id]: [track!.id],
            });
            this.showPlaylists.set(false);
          },
        };
      });
  });

  readonly songMenuActions = computed<ActionsMenuConfig<Track, Playlist>[]>(
    () => {
      if (this.showPlaylists()) {
        return this.menuPickActions();
      }
      return this.trackActions;
    }
  );

  readonly currentQuery = signal<QueryOptions>({
    sortBy: 'name',
    sortDirection: SortDirection.ASC,
  });
  readonly showPlaylists = signal<boolean>(false);

  readonly trackActions = this.defaultTrackActionsService.createActions({
    prependActions: [
      {
        text: 'Add to playlist',
        icon: actionsIconSet.AddIcon,
        onSelected: () => this.addToPlaylist(),
        keepOpen: true,
      },
    ],
  });
  readonly defaultSongActions: ActionsMenuBaseConfig<Track>[] = [
    {
      text: 'Play next',
      icon: iconSet.PlayNextIcon,
      onSelected: (track: Track) => this.playNext(track),
    },
    {
      text: 'Add to playlist',
      icon: actionsIconSet.AddIcon,
      onSelected: () => this.addToPlaylist(),
      keepOpen: true,
    },
    {
      text: 'Edit',
      icon: actionsIconSet.EditIcon,
      onSelected: (track: Track) => this.editTrack(track),
    },
    {
      text: 'Delete',
      icon: actionsIconSet.DeleteIcon,
      onSelected: (track: Track) => this.deleteTrack(track),
    },
  ];

  ngOnInit() {
    this.trackStore.load(this.currentQuery);
  }

  addToPlaylist(): void {
    this.showPlaylists.set(true);
  }

  openUploadDialog(audioTracks?: AudioTrack[]) {
    this.newTrackDropInService
      .startUploadSequence(audioTracks)
      .subscribe(() => {
        this.trackStore.load(this.currentQuery);
      });
  }

  playTrack(track: Track) {
    const trackIndex = this.tracks().findIndex(
      (libraryTrack) => libraryTrack.id === track.id
    );
    this.playbackService.play(
      track,
      this.displayTracks().slice(trackIndex + 1)
    );
  }

  pauseTrack() {
    this.playbackService.pause();
  }

  actionsClosed(reason: MenuCloseReason | string) {
    if (reason !== 'click' || this.showPlaylists()) {
      setTimeout(() => {
        this.showPlaylists.set(false);
      }, 250);
    }
  }

  private playNext(track: Track) {
    console.log(`Play next: ${track.name}`);
    return undefined;
  }

  private deleteTrack(track: Track | undefined) {
    if (!track) {
      return;
    }
    this.trackStore.removeTrack(track.id);
  }

  private editTrack(track: Track) {
    const dialog = this.dialogService.open<
      EditTrackModalComponent,
      EditTrackResult
    >(EditTrackModalComponent, {
      data: track,
    });
    dialog.afterClosed$.pipe(take(1)).subscribe((result) => {
      switch (result?.type) {
        case 'delete':
          this.deleteTrack(this.tracks().find((t) => t.id === result.trackId)!);
          break;
        case 'update':
          this.updateTrack(result.trackId, result.data);
          break;
      }
    });
  }

  private updateTrack(_: string, data: Track) {
    this.trackStore.updateTrack(data);
  }
}
