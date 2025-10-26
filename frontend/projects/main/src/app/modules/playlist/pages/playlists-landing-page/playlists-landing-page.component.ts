import { Component, inject } from '@angular/core';
import { PlaylistGridSmartComponent } from './playlist-grid/playlist-grid-smart/playlist-grid-smart.component';
import { MatButton } from '@angular/material/button';
import { DialogService } from '../../../../services/dialog.service';
import { CreatePlaylistModalComponent } from '../../modals/create-playlist-modal/create-playlist-modal.component';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { DialogRef } from '../../../../models/dialog.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { take } from 'rxjs';

@Component({
  selector: 'app-playlists-landing-page',
  imports: [PlaylistGridSmartComponent, MatButton],
  templateUrl: './playlists-landing-page.component.html',
  styleUrl: './playlists-landing-page.component.scss',
})
export class PlaylistsLandingPageComponent {
  readonly dialogService = inject(DialogService);
  readonly playlistStore = inject(PlaylistStore);

  private dialogRef:
    | DialogRef<CreatePlaylistModalComponent, PlaylistInsertQuery>
    | undefined;

  openCreateDialog() {
    if (this.dialogRef) {
      return;
    }

    this.dialogRef = this.dialogService.open<
      CreatePlaylistModalComponent,
      PlaylistInsertQuery
    >(CreatePlaylistModalComponent);
    this.dialogRef.afterClosed$.pipe(take(1)).subscribe((result) => {
      if (!result) {
        return;
      }
      this.playlistStore.insertNew(result);
    });
  }
}
