import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { FilesDropInZoneComponent } from '../../../library/pages/library-landing-page/songs-drop-in-zone/files-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';
import { SoundEffectTableComponent } from '../../components/sound-effect-table/sound-effect-table.component';
import { SoundEffectCardGridComponent } from '../../components/sound-effect-card-grid/sound-effect-card-grid.component';
import { SoundEffectVolumeChange } from './sound-effects-library-smart/sound-effects-library-smart.component';
import { SoundEffectDisplayModeSwitchComponent } from '../../components/sound-effect-display-mode-switch/sound-effect-display-mode-switch.component';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';

@Component({
  selector: 'app-sound-effects-library',
  imports: [
    FilesDropInZoneComponent,
    SoundEffectTableComponent,
    SoundEffectCardGridComponent,
    SoundEffectDisplayModeSwitchComponent,
    SearchBarComponent,
  ],
  templateUrl: './sound-effects-library.component.html',
  styleUrl: './sound-effects-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsLibraryComponent {
  readonly dataset = input<SoundEffect[]>([]);
  readonly loading = input<boolean>(false);
  readonly playingEffectIds = input<string[]>([]);

  readonly uploadAudioFiles = output<AudioTrack[]>();
  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
  readonly effectVolumeChange = output<SoundEffectVolumeChange>();
  readonly queryOptions = output<QueryOptions>();

  readonly showGrid = signal<boolean>(true);
  readonly currentSearch = signal<string | undefined>(undefined);
  readonly currentQueryOptions = computed<QueryOptions>(() => {
    return {
      search: this.currentSearch(),
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
  });

  constructor() {
    effect(() => {
      const queryOptions = this.currentQueryOptions();
      this.queryOptions.emit(queryOptions);
    });
  }

  readonly viewMode = computed(() => {
    return this.showGrid() ? 'grid' : 'table';
  });

  toggleViewMode(mode: 'table' | 'grid'): void {
    this.showGrid.set(mode === 'grid');
  }
}
