import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { createPlaylistForm } from './playlist-form.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '@general/components/controls/input/input.component';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';
import { FormField } from '@angular/forms/signals';
import { PlaylistSelectComponent } from '@general/components/controls/playlist-select/playlist-select.component';

@Component({
  selector: 'app-playlist-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    TagsInputComponent,
    FormField,
    PlaylistSelectComponent,
  ],
  templateUrl: './playlist-form.component.html',
  styleUrl: './playlist-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistFormComponent {
  readonly form = input(createPlaylistForm());
}
