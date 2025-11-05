import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { Tag } from '@shared/models/tag.model';
import { TagListComponent } from '@general/components/display/tag-list/tag-list.component';

@Component({
  selector: 'lib-tags-input',
  imports: [MatFormField, MatLabel, MatInput, TagListComponent],
  templateUrl: './tags-input.component.html',
  styleUrl: './tags-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputComponent implements ControlValueAccessor {
  readonly value = model<string[]>([]);
  readonly disabled = model<boolean>(false);

  readonly touched = output<void>();
  readonly changed = output<string[]>();

  readonly SEPARATORS = new RegExp(/\,(?=\w)/);
  readonly inputValue = signal<string>('');

  readonly tags = computed<Tag[]>(() => {
    return this.value().map((tag) => ({
      title: tag,
    }));
  });

  writeValue(value: string[] | string): void {
    if (typeof value === 'string' || !Array.isArray(value)) {
      this.value.set([]);
      return;
    }
    this.value.set(value);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.changed.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.touched.subscribe(fn);
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  createTag(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const parts = value.split(this.SEPARATORS);
    if (parts.length <= 1) {
      this.inputValue.set(value);
      return;
    }
    this.createAndSaveTag(parts[0]);
    this.inputValue.set(parts[1]);
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        this.createTagFromRemaining(event);
        break;
      case 'Backspace':
        this.editLastTag(event);
    }
  }

  createTagFromRemaining(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (event.type === 'focusout') {
      return;
    }

    if (value.trim().length === 0) {
      return;
    }

    this.createAndSaveTag(value);
    this.inputValue.set('');
  }

  private createAndSaveTag(value: string) {
    const trimmedText = value.replace(this.SEPARATORS, '').trim().toLowerCase();
    if (trimmedText.length === 0) {
      return;
    }
    this.value.set([...this.value(), trimmedText]);
    this.changed.emit(this.value());
  }

  private editLastTag(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value.length > 0) {
      return;
    }
    const tags = this.value();
    if (tags.length === 0) {
      return;
    }
    const newValue = tags[tags.length - 1];
    this.inputValue.set(newValue);
    const newTags = tags.slice(0, -1);
    this.value.set(newTags);
    this.changed.emit(newTags);
  }

  removeTag(removedTag: Tag) {
    const oldValue = this.value();
    const filteredValue = oldValue.filter((tag) => tag !== removedTag.title);
    this.value.set(filteredValue);
    this.changed.emit(filteredValue);
  }
}
