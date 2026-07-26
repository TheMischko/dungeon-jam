import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  linkedSignal,
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/input';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
} from '@angular/material/select';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@Component({
  selector: 'app-filter-box',
  imports: [MatFormField, MatSelect, MatOption, MatLabel],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
  templateUrl: './filter-box.component.html',
  styleUrl: './filter-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBoxComponent<T> {
  readonly options = input.required<T[]>();
  readonly optionDisplayField = input.required<keyof T>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('Select options');
  readonly selectionInput = input<T[]>([], { alias: 'selection' });
  readonly selection = linkedSignal(this.selectionInput);
  readonly trackBy = input<(index: number, item: T) => unknown>(
    (_, item) => item
  );

  readonly selectionChange = output<T[]>();

  protected emitSelection(event: MatSelectChange<T[]>) {
    this.selectionChange.emit(event.value);
  }
}
