import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationError } from '@angular/forms/signals';
import {
  MatFormField,
  MatHint,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { actionsIconSet } from '@general/icons/icons';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lib-date-picker',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatHint,
    MatSuffix,
    MatDatepicker,
    MatDatepickerToggle,
    LucideAngularModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly value = model<Date | null>(null);
  readonly touched = model<boolean>(false);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly ValidationError.WithField[]>([]);

  readonly formDisabled = signal<boolean>(false);

  readonly inputChange = output<Date | null>();
  readonly onTouched = output<void>();

  readonly isDisabled = computed<boolean>(() => {
    return this.disabled() || this.formDisabled();
  });

  readonly hasErrors = computed<boolean>(() => {
    return this.touched() && this.errors().length > 0;
  });

  readonly FORM_HINT = 'MM/DD/YYYY';
  readonly ClearIcon = actionsIconSet.CloseAppIcon;

  onInputChange(
    newValue: MatDatepickerInputEvent<Date, MatDatepicker<Date>>
  ): void {
    this.value.set(newValue.value);
    this.inputChange.emit(newValue.value);
  }

  writeValue(value: Date | null): void {
    this.value.set(value);
    this.onTouched.emit();
  }
  registerOnChange(fn: any): void {
    this.inputChange.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected setTouched() {
    this.touched.set(true);
    this.onTouched.emit();
  }

  protected clearValue(event: PointerEvent) {
    event.stopPropagation();

    this.value.set(null);
    this.inputChange.emit(null);
  }
}
