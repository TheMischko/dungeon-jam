import { ChangeDetectionStrategy, Component, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'lib-switch',
  imports: [
    MatSlideToggle,
  ],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true }
  ]
})
export class SwitchComponent implements ControlValueAccessor {
  readonly label = input<string | undefined>(undefined);
  readonly value = model<boolean>(false);

  readonly disabled = signal<boolean>(false);

  readonly toggled = output<boolean>();

  onChange: (newValue: boolean) => void = () => {};
  onTouched: () => void = () => {}

  writeValue(newValue: boolean): void {
      this.value.set(newValue);
  }
  registerOnChange(fn: (newValue: boolean) => void): void {
      this.onChange = fn;
  }
  registerOnTouched(fn: () => void ): void {
      this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
      this.disabled.set(isDisabled);
  }

  toggle(event: MatSlideToggleChange){
    if(this.disabled()){
      return;
    }
    const value = event.checked;
    this.value.set(value);
    this.toggled.emit(value);
    this.onChange(value);
    this.onTouched();
  }
}
