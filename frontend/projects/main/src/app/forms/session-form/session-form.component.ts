import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InputComponent } from '@general/components/controls/input/input.component';
import { FormField } from '@angular/forms/signals';
import { DatePickerComponent } from '@general/components/controls/date-picker/date-picker.component';
import { createSessionForm } from './session-form.model';

@Component({
  selector: 'app-session-form',
  imports: [InputComponent, FormField, DatePickerComponent],
  templateUrl: './session-form.component.html',
  styleUrl: './session-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionFormComponent {
  readonly form = input(createSessionForm());
}
