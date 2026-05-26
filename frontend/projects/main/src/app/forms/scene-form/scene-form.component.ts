import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { createSceneForm } from './scene-form.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '@general/components/controls/input/input.component';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';
import { FormField } from '@angular/forms/signals';
import { PlaylistSelectComponent } from '@general/components/controls/playlist-select/playlist-select.component';
import { ImageUploadComponent } from '../../components/image/image-upload/image-upload.component';

@Component({
  selector: 'app-scene-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    TagsInputComponent,
    FormField,
    PlaylistSelectComponent,
    ImageUploadComponent,
  ],
  templateUrl: './scene-form.component.html',
  styleUrl: './scene-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneFormComponent {
  readonly form = input(createSceneForm());
}
