import {
  Component,
  forwardRef,
  output,
  signal,
  input,
  computed,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';
import { ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'lib-input',
  imports: [MatFormField, MatInput, MatLabel, MatPrefix, LucideDynamicIcon],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent<
  V = string | number,
> implements ControlValueAccessor {
  readonly value = model<V | null>(null as V);
  readonly touched = model<boolean>(false);
  readonly required = input<boolean>(false);
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly iconPrefix = input<LucideIconData>();
  readonly errors = input<readonly ValidationError.WithField[]>([]);

  readonly inputChange = output<V | null>();
  readonly onTouched = output<void>();

  readonly formDisabled = signal<boolean>(false);

  readonly isDisabled = computed<boolean>(() => {
    return this.disabled() || this.formDisabled();
  });

  readonly hasErrors = computed<boolean>(() => {
    return this.touched() && this.errors().length > 0;
  });

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue: V = target?.value as V;

    const emitValue =
      typeof newValue === 'string' && !newValue.length
        ? null
        : (newValue ?? null);

    if (newValue !== undefined) {
      this.writeValue(emitValue);
      this.inputChange.emit(emitValue);
    }
  }

  writeValue(value: V | null): void {
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

  setTouched() {
    this.touched.set(true);
    this.onTouched.emit();
  }
}
