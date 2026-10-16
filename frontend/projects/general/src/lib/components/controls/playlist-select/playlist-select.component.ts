import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { PlaylistStore } from '@general/stores/playlist.store';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Playlist } from '@shared/models/playlist.model';
import { MatFormField, MatLabel, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs';
import {
  PlaylistSelectOption,
  sortAndGroupPlaylists,
} from './playlist-select.utils';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'lib-playlist-select',
  imports: [
    MatOption,
    MatFormField,
    MatLabel,
    MatInput,
    MatAutocompleteTrigger,
    MatAutocomplete,
    ReactiveFormsModule,
    NgStyle,
  ],
  templateUrl: './playlist-select.component.html',
  styleUrl: './playlist-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlaylistSelectComponent),
      multi: true,
    },
  ],
})
export class PlaylistSelectComponent implements OnInit, ControlValueAccessor {
  private readonly playlistStore = inject(PlaylistStore);

  readonly textControl = new FormControl<string | Playlist>('');

  readonly omitPlaylist = input<Playlist | undefined>(undefined);

  readonly value = signal<Playlist | null>(null);
  readonly disabled = signal(false);
  readonly label = input('Select Playlist');

  readonly playlists = this.playlistStore.entities;
  readonly loading = this.playlistStore.loading;

  readonly matchedIds = signal<Set<string> | null>(null);

  readonly playlistOptions = computed<PlaylistSelectOption[]>(() => {
    const omitPlaylist = this.omitPlaylist();
    const matchedIds = this.matchedIds();
    const fullOptions = sortAndGroupPlaylists(this.playlists());
    const matchedOptions = matchedIds
      ? fullOptions.filter((o) => matchedIds.has(o.playlist.id))
      : fullOptions;
    if (omitPlaylist) {
      return matchedOptions.filter(
        (p) => p.playlist.id !== omitPlaylist.id
      );
    }
    return matchedOptions;
  });

  readonly playlistIdMap = computed(() => {
    return new Map<string, Playlist>(this.playlists().map((p) => [p.id, p]));
  });

  constructor() {
    this.textControl.valueChanges
      .pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this.getMatchingIds(name) : null;
        })
      )
      .subscribe((matchedIds) => {
        this.matchedIds.set(matchedIds);
      });
  }

  ngOnInit() {
    if (!this.playlists().length) {
      this.playlistStore.load({});
    }
  }

  protected setValueFromSelect(event: MatAutocompleteSelectedEvent) {
    const newVal = event.option.value as Playlist | null;
    this.value.set(newVal);
    this.textControl.setValue(newVal, { emitEvent: false });
    this.valueChanged?.(newVal);
    this.touched?.();
  }

  protected displayFn(playlist: Playlist | null): string {
    if (!playlist) {
      return '';
    }
    return playlist.name;
  }

  protected onBlur(): void {
    const currentValue = this.textControl.value;

    if (typeof currentValue === 'string') {
      const match = this.findExactMatch(currentValue);
      if (match) {
        this.commitValue(match);
      } else {
        this.textControl.setValue(this.value(), { emitEvent: false });
      }
    }

    this.touched?.();
  }

  private findExactMatch(name: string): Playlist | null {
    const filterValue = name.trim().toLowerCase();
    if (!filterValue) {
      return null;
    }
    const match = this.playlistOptions().find(
      (option) => option.playlist.name.toLowerCase() === filterValue
    );
    return match?.playlist ?? null;
  }

  private commitValue(newVal: Playlist | null): void {
    this.value.set(newVal);
    this.textControl.setValue(newVal, { emitEvent: false });
    this.valueChanged?.(newVal);
  }

  private valueChanged: ((newVal: Playlist | null) => void) | undefined;
  private touched: (() => void) | undefined;

  writeValue(newVal: Playlist | null): void {
    this.value.set(newVal);
    this.textControl.setValue(newVal, { emitEvent: false });
  }
  registerOnChange(fn: (newVal: Playlist | null) => void): void {
    this.valueChanged = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.textControl.disable({ emitEvent: false });
    } else {
      this.textControl.enable({ emitEvent: false });
    }
  }

  private getMatchingIds(name: string): Set<string> {
    const filterValue = name.trim().toLowerCase();
    if (!filterValue) {
      return new Set(this.playlists().map((p) => p.id));
    }

    const idMap = this.playlistIdMap();
    const directMatches = this.playlists().filter((p) =>
      p.name.toLowerCase().includes(filterValue)
    );

    const result = new Set<string>();

    const addWithAncestors = (playlist: Playlist): void => {
      let current: Playlist | undefined = playlist;
      while (current && !result.has(current.id)) {
        result.add(current.id);
        current = current.ownershipId
          ? idMap.get(current.ownershipId)
          : undefined;
      }
    };

    const addWithDescendants = (playlist: Playlist): void => {
      if (result.has(playlist.id)) {
        return;
      }
      result.add(playlist.id);
      playlist.childrenIds?.forEach((childId) => {
        const child = idMap.get(childId);
        if (child) {
          addWithDescendants(child);
        }
      });
    };

    directMatches.forEach((playlist) => {
      addWithAncestors(playlist);
      addWithDescendants(playlist);
    });

    return result;
  }

  protected getPlaylistParent(playlist: Playlist): Playlist | null {
    if (!playlist.ownershipId) {
      return null;
    }
    return this.playlistIdMap().get(playlist.ownershipId) ?? null;
  }

  protected readonly Array = Array;

  protected getDepthIndent(depth: number) {
    if (depth === 0) {
      return {};
    }
    return { width: `${Math.min(depth, 5)}rem` };
  }
}
