import { Component, inject, output } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { PlaylistStore } from '@general/stores/playlist.store';
import { MatDivider } from '@angular/material/list';

@Component({
  selector: 'app-playlist-parent-filter',
  imports: [MatFormField, MatLabel, MatOption, MatSelect, MatDivider],
  templateUrl: './playlist-parent-filter.component.html',
  styleUrl: './playlist-parent-filter.component.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class PlaylistParentFilterComponent {
  private readonly playlistStore = inject(PlaylistStore);

  readonly parentSelected = output<PlaylistParentFilterChange>();

  readonly playlists = this.playlistStore.allParents;

  protected emitSelection(event: MatSelectChange<PlaylistParentFilterChange>) {
    this.parentSelected.emit(event.value);
  }
}

export type PlaylistParentFilterChange = string | null | 'no-parent';
