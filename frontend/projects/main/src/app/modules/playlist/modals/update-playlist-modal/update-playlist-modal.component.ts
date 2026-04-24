import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Playlist, PlaylistUpdateQuery } from '@shared/models/playlist.model';
import {
  createPlaylistForm,
  PlaylistForm,
  PlaylistFormData,
} from '../../../../forms/playlist-form/playlist-form.model';
import { TagsStore } from '@general/stores/tags.store';
import { MatButton } from '@angular/material/button';
import { PlaylistFormComponent } from '../../../../forms/playlist-form/playlist-form.component';

@Component({
  selector: 'app-update-playlist-modal',
  imports: [MatButton, PlaylistFormComponent],
  templateUrl: './update-playlist-modal.component.html',
  styleUrl: './update-playlist-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePlaylistModalComponent implements OnInit {
  readonly dialog = inject(MatDialogRef<void, PlaylistUpdateQuery>);
  readonly dialogData = inject<UpdatePlaylistModalData>(MAT_DIALOG_DATA);
  readonly tagStore = inject(TagsStore);

  readonly formData = computed<PlaylistFormData>(() => {
    const tags = this.tagStore.entityMap();
    const playlistTags = this.dialogData.playlist.tags
      .map((t) => tags[t])
      .filter((t) => !!t);

    return {
      ...this.dialogData.playlist,
      name: this.dialogData.playlist.name,
      description: this.dialogData.playlist.description ?? null,
      imageUrl: this.dialogData.playlist.imageUrl ?? null,
      parentPlaylist: this.dialogData.parentPlaylistId ?? null,
      tags: playlistTags,
    };
  });

  private readonly formFields = signal<PlaylistFormData>(this.formData());
  readonly form: PlaylistForm = createPlaylistForm(this.formFields);

  constructor() {
    effect(() => {
      this.formFields.set(this.formData());
    });
  }

  ngOnInit() {
    this.tagStore.loadAll();
  }

  protected save() {
    if (this.form().valid()) {
      const formValue = this.form().value();
      const originalTagIds = this.dialogData.playlist.tags ?? [];
      const removedTagIds = this.dialogData.playlist.tags.filter((tagId) =>
        !formValue.tags.some((formTag) => formTag.id === tagId)
      );
      const addedTagIds = formValue.tags
        .filter((t) => !originalTagIds.includes(t.id))
        .map((t) => t.id);
      this.dialog.close({
        id: this.dialogData.playlist.id,
        name: formValue.name,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        parentPlaylistId: formValue.parentPlaylist?.id ?? undefined,
        tagsRemoved: removedTagIds,
        tagsAdded: addedTagIds,
      } as PlaylistUpdateQuery);
    }
  }

  protected cancel() {
    this.dialog.close();
  }
}

export type UpdatePlaylistModalData = {
  playlist: Playlist;
  parentPlaylistId?: Playlist;
};
