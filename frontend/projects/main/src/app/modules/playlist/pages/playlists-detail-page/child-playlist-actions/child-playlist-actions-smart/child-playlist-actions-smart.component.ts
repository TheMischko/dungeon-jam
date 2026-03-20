import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';
import { DialogService } from '../../../../../../services/dialog.service';
import {
  CreatePlaylistModalComponent,
  CreatePlaylistModalData,
} from '../../../../modals/create-playlist-modal/create-playlist-modal.component';
import { ChildPlaylistActionsComponent } from '../child-playlist-actions.component';
import { PlaylistStore } from '@general/stores/playlist.store';

@Component({
  selector: 'app-child-playlist-actions-smart',
  imports: [
    ChildPlaylistActionsComponent,
  ],
  templateUrl: './child-playlist-actions-smart.component.html',
  styleUrl: './child-playlist-actions-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildPlaylistActionsSmartComponent {
  private readonly dialogService = inject(DialogService);
  private readonly playlistStore = inject(PlaylistStore);

  readonly parent = input.required<Playlist>();

  createNewChildPlaylist(): void {
    const data: CreatePlaylistModalData = {
      parentPlaylist: this.parent(),
    };
    const dialogRef = this.dialogService.open<CreatePlaylistModalComponent, PlaylistInsertQuery>(CreatePlaylistModalComponent, { data });

    dialogRef.afterClosed$.subscribe((newPlaylist) => {
      if(!newPlaylist) {
        return;
      }
      this.playlistStore.insertNew(newPlaylist)
    })
  }
}
