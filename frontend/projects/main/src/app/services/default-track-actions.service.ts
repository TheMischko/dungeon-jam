import { inject, Injectable } from '@angular/core';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { Track } from '@shared/models/track.model';
import { actionsIconSet, iconSet } from '@general/icons/icons';
import { PlaybackService } from './playback.service';
import { TrackLibraryStore } from '../stores/track-library.store';
import { Subject, take } from 'rxjs';
import { DialogService } from './dialog.service';
import {
  EditTrackModalComponent,
  EditTrackResult,
} from '../modules/library/modals/edit-track-modal/edit-track-modal.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../components/dialog/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DefaultTrackActionsService {
  private readonly playbackService = inject(PlaybackService);
  private readonly tracksStore = inject(TrackLibraryStore);
  private readonly dialogService = inject(DialogService);

  private readonly _afterPlayNext$ = new Subject<Track>();
  get afterPlayNext$() {
    return this._afterPlayNext$.asObservable();
  }

  private readonly _afterAddToPlaylist$ = new Subject<void>();
  get afterAddToPlaylist$() {
    return this._afterAddToPlaylist$.asObservable();
  }

  private readonly _afterEditTrack$ = new Subject<Track>();
  get afterEditTrack$() {
    return this._afterEditTrack$.asObservable();
  }

  private readonly _afterDeleteTrack$ = new Subject<Track>();
  get afterDeleteTrack$() {
    return this._afterDeleteTrack$.asObservable();
  }

  readonly defaultSongActions: ActionsMenuBaseConfig<
    Track,
    DefaultTrackActionKey
  >[] = [
    {
      key: 'playNext',
      text: 'Play next',
      icon: iconSet.PlayNextIcon,
      onSelected: (track: Track) => this.playNext(track),
    },
    {
      key: 'edit',
      text: 'Edit',
      icon: actionsIconSet.EditIcon,
      onSelected: (track: Track) => this.editTrack(track),
    },
    {
      key: 'delete',
      text: 'Delete',
      icon: actionsIconSet.DeleteIcon,
      onSelected: (track: Track) => this.deleteTrack(track),
    },
  ];

  createActions(
    config: DefaultTrackActionsConfig = {}
  ): ActionsMenuBaseConfig<Track>[] {
    const filteredActions = this.defaultSongActions.filter((action) => {
      const excludedKeys = config.excludeActions;
      if (!excludedKeys || !excludedKeys.length) {
        return true;
      }
      return !excludedKeys.includes(action.key!);
    });
    return [
      ...(config?.prependActions ?? []),
      ...filteredActions,
      ...(config?.appendActions ?? []),
    ];
  }

  private playNext(track: Track) {
    this.playbackService.injectNext(track);
    this._afterPlayNext$.next(track);
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
          this.deleteTrack(track);
          this._afterDeleteTrack$.next(track);
          break;
        case 'update':
          this.updateTrack(result.trackId, result.data);
          this._afterEditTrack$.next(result?.data ?? track);
          break;
      }
    });
  }

  private updateTrack(_: string, data: Track) {
    this.tracksStore.updateTrack(data);
  }

  private deleteTrack(track: Track | undefined) {
    if (!track) {
      return;
    }
    const dialogRef = this.dialogService.open<
      ConfirmationDialogComponent,
      boolean
    >(ConfirmationDialogComponent, {
      data: {
        title: 'Delete track',
        message: `Are you sure you want to delete track "${track.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        dismissText: 'Cancel',
      } satisfies ConfirmationDialogData,
    });

    dialogRef.afterClosed$.subscribe((confirmed) => {
      if (confirmed) {
        this.tracksStore.removeTrack(track.id);
        this._afterDeleteTrack$.next(track);
      }
    });
  }
}

export type DefaultTrackActionKey = 'playNext' | 'edit' | 'delete';

export interface DefaultTrackActionsConfig {
  excludeActions?: ('playNext' | 'edit' | 'delete')[];
  appendActions?: ActionsMenuBaseConfig<Track>[];
  prependActions?: ActionsMenuBaseConfig<Track>[];
}
