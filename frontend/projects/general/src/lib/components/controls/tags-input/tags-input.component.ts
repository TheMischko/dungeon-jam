import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { Tag, TagData } from '@shared/models/tag.model';
import { TagListComponent } from '@general/components/display/tag-list/tag-list.component';
import { TagApiService } from '@general/services/tag-api.service';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-tags-input',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    TagListComponent,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
  ],
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
  private readonly tagApiService = inject(TagApiService);

  readonly value = model<TagData[]>([]);
  readonly disabled = model<boolean>(false);

  readonly suggestionBar = viewChild<MatAutocomplete>('suggestionBar');

  readonly touched = output<void>();
  readonly changed = output<TagData[]>();

  private onChange: (value: TagData[]) => void = () => {};
  private onTouched: () => void = () => {};

  readonly SEPARATORS = new RegExp(/,(?=\w)?/);
  readonly suggestions = signal<TagData[]>([]);
  readonly inputValue = signal<string>('');

  writeValue(value: TagData[] | null): void {
    this.value.set(value ?? []);
    this.setInputValue('');
    this.suggestions.set([]);
    this.resetSuggestions();
  }
  registerOnChange(fn: (value: (Tag | TagData)[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /**
   * Take current value, show suggestions, and if separator found, create tag
   * @param event
   */
  async handleUserTyping(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    this.showSuggestions(value);

    const parts = value.split(this.SEPARATORS);
    if (parts.length <= 1) {
      return;
    }
    await this.createAndSaveTag(parts[0].trim());
    this.setInputValue('');
  }

  /**
   * Handle key down events from the input
   * @param event
   */
  async handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        await this.createTagFromRemaining(event);
        break;
      case 'Backspace':
        this.editLastTag(event);
    }
  }

  /**
   * Takes the current input value and creates a tag from it
   * @param event
   */
  async createTagFromRemaining(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (event.type === 'focusout') {
      return;
    }
    if (value.trim().length === 0) {
      return;
    }

    this.setInputValue('');
    await this.createAndSaveTag(value);
  }

  /**
   * Remove a tag from the value
   * @param removedTag
   */
  removeTag(removedTag: Tag | TagData) {
    const oldValue = this.value();
    const filteredValue = oldValue.filter((tag) => {
      const removed = removedTag as TagData;
      if (removed?.id) {
        return tag.id !== removed.id;
      }
      return tag.title === removed.title;
    });
    this.value.set(filteredValue);
    this.emitValueChange();
  }

  /**
   * Save the selected suggestion to the value
   * @param event
   */
  async saveSuggestion(_: unknown, suggestion: TagData) {
    this.value.update((tags) => [...tags, suggestion]);
    this.setInputValue('');
    this.emitValueChange();
  }

  /**
   * Emit value change event with current value
   * @private
   */
  private emitValueChange() {
    const value = untracked(() => this.value());
    this.changed.emit(value);
    this.touched.emit();
    this.onChange(value);
    this.onTouched();
  }

  /**
   * Trim the value, find or create the tag, and save it to the value
   * @param value
   * @private
   */
  private async createAndSaveTag(value: string) {
    const trimmedText = value.replace(this.SEPARATORS, '').trim().toLowerCase();
    if (trimmedText.length === 0) {
      return;
    }
    const newTag = await this.getTagFromValue(trimmedText);
    this.value.set([...this.value(), newTag]);
    this.emitValueChange();
  }

  /**
   * Edit the last tag when backspace is pressed and input is empty
   * @param event
   * @private
   */
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
    this.setInputValue(newValue.title);
    const newTags = tags.slice(0, -1);
    this.value.set(newTags);
    this.emitValueChange();
  }

  /**
   * Set the value of text input
   * @param value
   * @private
   */
  private setInputValue(value: string) {
    requestAnimationFrame(() => {
      this.inputValue.set(value);
      const inputEl = document.querySelector<HTMLInputElement>('.tag-input');
      if (inputEl && inputEl.value !== value) {
        inputEl.value = value;
      }
    });
  }

  /**
   * Reset suggestion selections
   * @private
   */
  private resetSuggestions() {
    requestAnimationFrame(() => {
      const autocomplete = this.suggestionBar();
      if (!autocomplete?.options) {
        return;
      }
      autocomplete.options.forEach((options) => options.deselect());
    });
  }

  /**
   * Get tag data from value, creating a new tag if necessary
   * @param value
   * @private
   */
  private async getTagFromValue(value: string): Promise<TagData> {
    const suggestions = untracked(() => this.suggestions());
    const suggestionTag = suggestions.find((tag) => tag.title === value);
    if (suggestionTag) {
      return suggestionTag;
    }
    const newTagData = {
      title: value,
    } as Tag;
    return await firstValueFrom(this.tagApiService.insertTag(newTagData));
  }

  private showSuggestions(value: string): void {
    if (value.length === 0) {
      return;
    }

    this.tagApiService.getTagSuggestion(value).subscribe((tags) => {
      const value = untracked(() => this.value());
      const notAlreadySelected = tags.filter(
        (tag) => !value.some((v) => v.id === tag.id),
      );
      this.suggestions.set(notAlreadySelected);
    });
  }
}
