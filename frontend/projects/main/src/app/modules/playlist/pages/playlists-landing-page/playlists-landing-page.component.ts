import { Component, inject } from '@angular/core';
import { PlaylistGridSmartComponent } from './playlist-grid/playlist-grid-smart/playlist-grid-smart.component';
import { MatButton } from '@angular/material/button';
import { DialogService } from '../../../../services/dialog.service';
import { CreatePlaylistModalComponent } from '../../modals/create-playlist-modal/create-playlist-modal.component';
import { PlaylistInsertQuery } from '@shared/models/playlist.model';
import { PlaylistStore } from '@general/stores/playlist.store';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { Tag, TagData } from '@shared/models/tag.model';
import { TagApiService } from '@general/services/tag-api.service';

@Component({
  selector: 'app-playlists-landing-page',
  imports: [PlaylistGridSmartComponent, MatButton],
  templateUrl: './playlists-landing-page.component.html',
  styleUrl: './playlists-landing-page.component.scss',
})
export class PlaylistsLandingPageComponent {
  readonly dialogService = inject(DialogService);
  readonly playlistStore = inject(PlaylistStore);
  readonly tagApiService = inject(TagApiService);

  openCreateDialog() {
    const dialogRef = this.dialogService.open<
      CreatePlaylistModalComponent,
      PlaylistInsertQuery
    >(CreatePlaylistModalComponent);

    dialogRef.afterClosed$
      .pipe(
        switchMap((result) => {
          if (!result) {
            return of(result);
          }
          const tagsToCreate = result.tags.filter(
            (tag) => (tag as TagData).id === undefined,
          );
          const tagsReady = result.tags.filter(
            (tag) => (tag as TagData).id !== undefined,
          );
          if (tagsToCreate.length === 0) {
            return of(result);
          }

          const requests = tagsToCreate.map((tag: Tag) =>
            this.tagApiService.insertTag(tag),
          );
          return this.tagApiService.clearOrphanedTags().pipe(
            switchMap(() => {
              return combineLatest(requests);
            }),
            map((tags) => {
              return {
                ...result,
                tags: [...tagsReady, ...tags.map((t) => t.id)],
              } as PlaylistInsertQuery;
            }),
          );
        }),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.playlistStore.insertNew(result);
      });
  }
}
