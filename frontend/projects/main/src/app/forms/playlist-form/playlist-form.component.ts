import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { createPlaylistForm } from './playlist-form.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '@general/components/controls/input/input.component';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';
import { FormField } from '@angular/forms/signals';
import { PlaylistSelectComponent } from '@general/components/controls/playlist-select/playlist-select.component';
import { ImageUploadComponent } from '../../components/image/image-upload/image-upload.component';
import { Playlist } from '@shared/models/playlist.model';

@Component({
  selector: 'app-playlist-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    TagsInputComponent,
    FormField,
    PlaylistSelectComponent,
    ImageUploadComponent,
  ],
  templateUrl: './playlist-form.component.html',
  styleUrl: './playlist-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistFormComponent {
  readonly form = input(createPlaylistForm());
  readonly omitParentPlaylistOption = input<Playlist | undefined>();

  protected updateImage(event: string | null) {
    // To-DO: Reenable this or remake image upload to form control
    this.form().imageUrl().value.set(event);
  }
}
