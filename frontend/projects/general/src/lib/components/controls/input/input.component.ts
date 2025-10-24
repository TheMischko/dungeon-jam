import {
  Component,
  forwardRef,
  output,
  signal,
  input,
  computed,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
} from '@angular/material/input';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'lib-input',
  imports: [MatFormField, MatInput, MatLabel, MatPrefix, LucideAngularModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent<V = string | number | null>
  implements ControlValueAccessor
{
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly iconPrefix = input<LucideIconData>();

  readonly input = output<V>();
  readonly touched = output<void>();

  readonly value = model<V>(undefined as V);
  readonly formDisabled = signal<boolean>(false);

  readonly isDisabled = computed<boolean>(() => {
    return this.disabled() || this.formDisabled();
  });

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue: V = target?.value as V;
    if (newValue !== undefined) {
      this.writeValue(newValue);
    }
  }

  writeValue(value: V): void {
    this.value.set(value);
    this.input.emit(value);
    this.touched.emit();
  }
  registerOnChange(fn: any): void {
    this.input.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.touched.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
