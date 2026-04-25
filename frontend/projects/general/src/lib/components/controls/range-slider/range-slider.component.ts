import {
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';

@Component({
  selector: 'lib-range-slider',
  imports: [MatSlider, MatSliderThumb, LucideAngularModule],
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true,
    },
  ],
})
export class RangeSliderComponent implements ControlValueAccessor {
  readonly minValue = input<number>();
  readonly maxValue = input<number>();
  readonly stepSize = input<number>();
  readonly prefix = input<string | LucideIconData>();
  readonly suffix = input<string | LucideIconData>();
  readonly iconSize = input<number>(18);

  readonly inputChange = output<number>();
  readonly touchedChange = output<void>();

  readonly value = model<number>(1);
  readonly disabled = signal<boolean>(false);

  readonly prefixIcon = computed<LucideIconData | undefined>(() => {
    const prefix = this.prefix();
    if (!prefix || typeof prefix === 'string') {
      return;
    }
    return prefix;
  });

  readonly suffixIcon = computed<LucideIconData | undefined>(() => {
    const suffix = this.suffix();
    if (!suffix || typeof suffix === 'string') {
      return;
    }
    return suffix;
  });

  readonly isSuffixIcon = computed<boolean>(() => {
    return typeof this.suffix() !== 'string';
  });

  writeValue(val: number): void {
    this.value.set(val);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.inputChange.subscribe(fn);
  }
  registerOnTouched(fn: () => void): void {
    this.touchedChange.subscribe(fn);
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  changeValue(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.valueAsNumber;
    this.writeValue(value);
    this.inputChange.emit(value);
    this.touchedChange.emit();
  }
}
