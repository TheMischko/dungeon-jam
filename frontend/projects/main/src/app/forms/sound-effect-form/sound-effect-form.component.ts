import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SoundEffectForm } from './sound-effect-form.model';
import { InputComponent } from '@general/components/controls/input/input.component';
import { FormField } from '@angular/forms/signals';
import { TagsInputComponent } from '@general/components/controls/tags-input/tags-input.component';

@Component({
  selector: 'app-sound-effect-form',
  imports: [InputComponent, FormField, TagsInputComponent],
  templateUrl: './sound-effect-form.component.html',
  styleUrl: './sound-effect-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectFormComponent {
  readonly form = input.required<SoundEffectForm>();
}
