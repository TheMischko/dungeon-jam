import {
  Component,
  computed,
  inject,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';
import { TracksUploadModalComponent } from '../../modals/tracks-upload-modal/tracks-upload-modal.component';
import { MatButton } from '@angular/material/button';
import { DialogService } from '../../../../services/dialog.service';
import { SongsDropInZoneComponent } from './songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack, Track } from '@shared/models/track.model';
import { AudioFilesService } from '../../../../services/audio-files.service';
import { TrackService } from '../../../../services/track.service';
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

@Component({
  selector: 'app-library-landing-page',
  imports: [MatButton, SongsDropInZoneComponent, SongsTableComponent],
  templateUrl: './library-landing-page.component.html',
  styleUrl: './library-landing-page.component.scss',
})
export class LibraryLandingPageComponent implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly audioFilesService = inject(AudioFilesService);
  private readonly trackService = inject(TrackService);
  private readonly playbackService = inject(PlaybackService);
  readonly playlistsStore = inject(PlaylistStore);
  private readonly locale = inject(LOCALE_ID);

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
    const searchValue = this.currentSearchValue();

    return this.tracks().filter((track) => {
      return (
        track?.author?.toLocaleLowerCase(this.locale).includes(searchValue) ||
        track.name.toLocaleLowerCase(this.locale).includes(searchValue) ||
        track.author?.toLocaleLowerCase(this.locale)?.includes(searchValue)
      );
    });
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
            config: ActionsMenuDataConfig<Track, Playlist>,
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
      return this.defaultSongActions;
    },
  );

  readonly tracks = signal<Track[]>([]);
  readonly currentSearchValue = signal<string>('');
  readonly showPlaylists = signal<boolean>(false);

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
      text: 'Delete',
      icon: actionsIconSet.DeleteIcon,
      onSelected: (track: Track) => this.deleteTrack(track),
    },
  ];

  ngOnInit() {
    this.trackService.getAllTracks().subscribe((tracks) => {
      this.tracks.set(tracks);
    });
  }

  addToPlaylist(): void {
    this.showPlaylists.set(true);
  }

  openUploadDialog(audioTracks?: AudioTrack[]) {
    const dialog = this.dialogService.open<
      TracksUploadModalComponent,
      AudioTrack[] | null
    >(TracksUploadModalComponent, {
      data: {
        title: 'Upload',
        tracks: audioTracks,
      },
    });

    dialog.afterClosed$.subscribe((tracks) => {
      if (!tracks) {
        return;
      }
      this.audioFilesService.uploadAudioTracks(tracks).subscribe(() => {
        this.trackService.getAllTracks().subscribe((tracks) => {
          this.tracks.set(tracks);
        });
      });
    });
  }

  playTrack(track: Track) {
    const trackIndex = this.tracks().findIndex(
      (libraryTrack) => libraryTrack.id === track.id,
    );
    this.playbackService.play(
      track,
      this.displayTracks().slice(trackIndex + 1),
    );
  }

  pauseTrack() {
    this.playbackService.pause();
  }

  searchTracks(searchValue: string) {
    this.currentSearchValue.set(searchValue.toLocaleLowerCase(this.locale));
  }

  actionsClosed(reason: MenuCloseReason) {
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

  private deleteTrack(track: Track) {
    console.log(`Remove song: ${track.name}`);
  }
}
