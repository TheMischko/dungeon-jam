import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { createTrackForm } from './track-form.model';
import { InputComponent } from '@general/components/controls/input/input.component';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';
import { Field } from '@angular/forms/signals';

@Component({
  selector: 'app-track-form',
  imports: [InputComponent, TagsInputComponent, Field],
  templateUrl: './track-form.component.html',
  styleUrl: './track-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackFormComponent {
  readonly form = input(createTrackForm());
  readonly formFields = this.form;
}
