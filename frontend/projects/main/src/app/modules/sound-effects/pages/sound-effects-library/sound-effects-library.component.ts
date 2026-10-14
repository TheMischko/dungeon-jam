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
import { SoundEffectsDisplayComponent } from '../../components/sound-effects-display/sound-effects-display.component';
import { SoundEffectVolumeChange } from './sound-effects-library-smart/sound-effects-library-smart.component';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatButton } from '@angular/material/button';
import { PaginationConfig } from '../../../../models/pagination.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-sound-effects-library',
  imports: [FilesDropInZoneComponent, SoundEffectsDisplayComponent, MatButton],
  templateUrl: './sound-effects-library.component.html',
  styleUrl: './sound-effects-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsLibraryComponent {
  readonly dataset = input<SoundEffect[]>([]);
  readonly loading = input<boolean>(false);
  readonly playingEffectIds = input<string[]>([]);
  readonly focusSoundEffectId = input<string>();
  readonly pagination = input<PaginationConfig | undefined>(undefined);

  readonly uploadAudioFiles = output<AudioTrack[]>();
  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
  readonly effectVolumeChange = output<SoundEffectVolumeChange>();
  readonly queryOptions = output<QueryOptions>();
  readonly editSoundEffect = output<SoundEffect>();
  readonly deleteSoundEffect = output<SoundEffect>();
  readonly reorderDrop = output<CdkDragDrop<SoundEffect[]>>();
  readonly openAudioFilesDialog = output<void>();
  readonly search = output<string>();
  readonly pageChange = output<PageEvent>();

  readonly currentSearch = signal<string>('');
  readonly currentQueryOptions = computed<QueryOptions>(() => {
    const search = this.currentSearch();
    return {
      search: search.length > 0 ? search : undefined,
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
  });
  readonly actionMenuConfig: ActionsMenuBaseConfig<SoundEffect>[] = [
    {
      text: 'Edit',
      onSelected: (soundEffect) => this.editSoundEffect.emit(soundEffect),
    },
    {
      text: 'Delete',
      onSelected: (soundEffect) => this.deleteSoundEffect.emit(soundEffect),
    },
  ];

  constructor() {
    effect(() => {
      const queryOptions = this.currentQueryOptions();
      this.queryOptions.emit(queryOptions);
    });
    effect(() => {
      const focusId = this.focusSoundEffectId();
      if (!focusId) {
        return;
      }
      if (this.loading()) {
        return;
      }
      if (!this.dataset()?.length) {
        return;
      }
      requestAnimationFrame(() => {
        this.focusElementWithId(focusId);
      });
    });
  }

  focusElementWithId(soundEffectId: string): void {
    const selector = `[sound-effect-id="${soundEffectId}"]`;
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }
    element.scrollIntoView({
      block: 'center',
    });
    element.classList.add('highlight-focus');
  }
}
