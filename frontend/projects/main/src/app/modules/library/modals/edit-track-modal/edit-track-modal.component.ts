import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Track } from '@shared/models/track.model';
import {
  createTrackForm,
  TrackForm,
} from '../../../../forms/track-form/track-form.model';
import { TagsStore } from '@general/stores/tags.store';
import { disabled } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { TrackFormComponent } from '../../../../forms/track-form/track-form.component';
import { LoaderComponent } from '@general/components/display/loader/loader.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatestWith, map } from 'rxjs';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-edit-track-modal',
  imports: [
    MatButton,
    TrackFormComponent,
    LoaderComponent,
    LucideDynamicIcon,
  ],
  templateUrl: './edit-track-modal.component.html',
  styleUrl: './edit-track-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTrackModalComponent {
  readonly track = inject<Track>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef);
  readonly tagStore = inject(TagsStore);
  readonly loading = this.tagStore.loading;

  readonly loading$ = toObservable(this.loading);
  readonly initialized$ = toObservable(this.tagStore.initialized);
  readonly tagsReady = this.loading$.pipe(
    combineLatestWith(this.initialized$),
    map(([loading, initialized]) => !loading && initialized)
  );

  readonly saveIcon = actionsIconSet.SaveIcon;
  readonly deleteIcon = actionsIconSet.DeleteIcon;

  readonly trackForm = signal<TrackForm>(
    createTrackForm(
      {
        title: '',
        author: '',
        path: '',
        tags: [],
      },
      (form) => {
        disabled(form.path);
      }
    )
  );

  constructor() {
    this.tagsReady.subscribe((ready) => {
      if (!ready) {
        return;
      }
      const tags =
        this.track.tags
          ?.map((tagId) => {
            return this.tagStore.getById(tagId);
          })
          .filter((v) => !!v) || [];
      this.trackForm().title().value.set(this.track.name);
      this.trackForm()
        .author()
        .value.set(this.track.author ?? '');
      this.trackForm().path().value.set(this.track.url);
      this.trackForm().tags().value.set(tags);
    });
  }

  cancel() {
    this.dialog.close({
      type: 'cancel',
    });
  }

  deleteTrack() {
    this.dialog.close({
      type: 'delete',
      trackId: this.track.id,
    });
  }

  updateTrack() {
    const updateValues = this.trackForm()?.().value();
    this.dialog.close({
      type: 'update',
      trackId: this.track.id,
      data: {
        ...this.track,
        name: updateValues.title!,
        author: updateValues.author!,
        tags: updateValues?.tags.map((t) => t.id),
      },
    });
  }
}

export type EditTrackResult = CancelResult | DeleteResult | UpdateResult;

export type CancelResult = {
  type: 'cancel';
};

export type DeleteResult = {
  type: 'delete';
  trackId: string;
};

export type UpdateResult = {
  type: 'update';
  trackId: string;
  data: Track;
};
