import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  model,
  output,
  signal,
  untracked,
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

  readonly value = model<string[]>([]);
  readonly disabled = model<boolean>(false);

  readonly touched = output<void>();
  readonly changed = output<(Tag | TagData)[]>();

  readonly SEPARATORS = new RegExp(/\,(?=\w)?/);
  readonly inputValue = signal<string>('');
  readonly suggestions = signal<TagData[]>([]);
  readonly tagMap = signal<Record<string, TagData | Tag>>({});
  readonly tags = computed(() => Object.values(this.tagMap()));

  constructor() {
    effect(() => {
      const value = this.inputValue();
      if (value.length === 0) {
        return;
      }

      this.tagApiService.getTagSuggestion(value).subscribe((tags) => {
        this.suggestions.set(tags);
      });
    });

    effect(() => {
      const value = this.value();
      const tagMap = untracked(() => this.tagMap());
      const tags = value.map((tagName) => {
        const knownTag = tagMap[tagName] as Tag | TagData | undefined;
        if (knownTag) {
          return knownTag;
        }
        const suggestions = untracked(() => this.suggestions());
        const suggestionTag = suggestions.find((tag) => tag.title === tagName);
        if (suggestionTag) {
          return suggestionTag;
        }
        return {
          title: tagName,
        } as Tag;
      });
      const newTagMap = tags.reduce(
        (map, tag, _, __) => {
          return {
            ...map,
            [tag.title]: tag,
          };
        },
        {} as Record<string, TagData | Tag>,
      );
      this.tagMap.set(newTagMap);
      this.changed.emit(tags);
    });
  }

  writeValue(value: string[] | string): void {
    if (typeof value === 'string' || !Array.isArray(value)) {
      this.value.set([]);
      return;
    }
    this.value.set(value);
  }
  registerOnChange(fn: (value: (Tag | TagData)[]) => void): void {
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
  }

  removeTag(removedTag: Tag) {
    const oldValue = this.value();
    const filteredValue = oldValue.filter((tag) => tag !== removedTag.title);
    this.value.set(filteredValue);
  }

  saveSuggestion(event: { source: { value: string } }) {
    const value = event.source.value as string;
    this.value.update((tags) => [...tags, value]);
    this.inputValue.set('');
  }
}
