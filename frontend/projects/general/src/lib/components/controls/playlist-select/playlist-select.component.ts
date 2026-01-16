import { ChangeDetectionStrategy, Component, forwardRef, inject, input, signal } from '@angular/core';
import { PlaylistStore } from '@general/stores/playlist.store';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Playlist } from '@shared/models/playlist.model';
import { MatFormField, MatLabel, MatOption, MatSelect, MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'lib-playlist-select',
  imports: [
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
  ],
  templateUrl: './playlist-select.component.html',
  styleUrl: './playlist-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PlaylistSelectComponent), multi: true }
  ]
})
export class PlaylistSelectComponent implements ControlValueAccessor{
  private readonly playlistStore = inject(PlaylistStore);
  readonly value = signal<Playlist | null>(null);
  readonly disabled = signal(false);
  readonly label = input('Select Playlist');

  readonly playlists = this.playlistStore.entities;
  readonly loading = this.playlistStore.loading;

  protected setValueFromSelect(event: MatSelectChange<Playlist>) {
    const newVal = event.value;
    this.value.set(newVal);
    this.valueChanged?.(newVal);
    this.touched?.();
  }

  private valueChanged: ((newVal: Playlist) => void) | undefined;
  private touched: (() => void) | undefined;

  writeValue(newVal: Playlist): void {
    this.value.set(newVal);
    this.valueChanged?.(newVal);
  }
  registerOnChange(fn: (newVal: Playlist) => void): void {
    this.valueChanged = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
