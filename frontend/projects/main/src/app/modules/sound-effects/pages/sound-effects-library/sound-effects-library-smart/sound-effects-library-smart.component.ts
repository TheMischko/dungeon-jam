import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { SoundEffectsLibraryComponent } from '../sound-effects-library.component';
import { AudioTrack } from '@shared/models/track.model';
import { NewSoundEffectUploadService } from '../../../services/new-sound-effect-upload.service';
import { take } from 'rxjs';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SoundEffectsPlayerService } from '../../../../../services/sound-effects-player.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { QueryOptions } from '@shared/models/request.model';
import { SortDirection } from '@shared/models/common.model';
import { DialogService } from '../../../../../services/dialog.service';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import {
  EditSoundEffectResult,
  SoundEffectEditModalComponent,
} from '../../../modals/sound-effect-edit-modal/sound-effect-edit-modal.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AudioFilesService } from '../../../../../services/audio-files.service';
import { SignalPaginationService } from '@general/services/signal-pagination.service';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION_PAGES,
  PaginationConfig,
} from '../../../../../models/pagination.model';
import { PageEvent } from '@angular/material/paginator';
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';

@Component({
  selector: 'app-sound-effects-library-smart',
  imports: [SoundEffectsLibraryComponent],
  templateUrl: './sound-effects-library-smart.component.html',
  styleUrl: './sound-effects-library-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsLibrarySmartComponent {
  private readonly soundEffectStore = inject(SoundEffectStore);
  private readonly newSoundEffectUploadService = inject(
    NewSoundEffectUploadService
  );
  private readonly soundEffectPlayerService = inject(SoundEffectsPlayerService);
  private readonly dialogService = inject(DialogService);
  private readonly audioFilesService = inject(AudioFilesService);

  readonly paginationService!: SignalPaginationService<SoundEffect>;

  /**
   * Value of a URL parameter for focusing a certain sound effect on page visit.
   */
  readonly soundEffectId = input<string>();

  private readonly playingEffects = toSignal(
    this.soundEffectPlayerService.playingEffects$,
    { initialValue: [] }
  );
  readonly playingEffectIds = computed(() =>
    this.playingEffects().map((e) => e.id)
  );

  readonly soundEffects = signal<SoundEffect[]>([]);
  readonly paginatedSoundEffects = computed(() => {
    return this.paginationService.currentPageData();
  });
  readonly currentQueryOptions = signal<QueryOptions>({
    sortBy: 'name',
    sortDirection: SortDirection.ASC,
  });
  readonly loading = this.soundEffectStore.loading;
  readonly paginationConfig = computed<PaginationConfig>(() => ({
    pageSizeOptions: DEFAULT_PAGINATION_PAGES,
    pageSize: this.paginationService.pageSize(),
    totalItems: this.paginationService.totalItems() ?? 0,
    currentPageIndex: this.paginationService.currentPageIndex() ?? 0,
  }));

  constructor() {
    effect(() => {
      const soundEffects = this.soundEffectStore.entities();
      const orderMap = this.soundEffectStore.latestOrderMap();
      this.soundEffects.set(this.orderSoundEffects(soundEffects, orderMap));
    });
    this.soundEffectStore.loadAll(this.currentQueryOptions);

    this.paginationService = SignalPaginationService.create(this.soundEffects);
    this.paginationService.pageSize.set(DEFAULT_PAGE_SIZE);
    effect(() => {
      if (this.loading()) {
        this.paginationService.resetPage();
      }
    });
  }

  createFromFiles(audioTracks?: AudioTrack[]): void {
    this.newSoundEffectUploadService
      .startUploadSequence(audioTracks)
      .pipe(take(1))
      .subscribe();
  }

  async playEffect(soundEffect: SoundEffect): Promise<void> {
    await this.soundEffectPlayerService.playEffect(soundEffect);
  }

  stopEffect(soundEffect: SoundEffect): void {
    this.soundEffectPlayerService.stopEffect(soundEffect.id);
  }

  protected toggleEffectLoop(soundEffect: SoundEffect): void {
    this.soundEffectStore.updateEffect({
      ...soundEffect,
      looping: !soundEffect.looping,
    });
    const isPlaying = this.playingEffectIds().includes(soundEffect.id);
    if (isPlaying) {
      this.soundEffectPlayerService.setEffectLoop(
        soundEffect.id,
        !soundEffect.looping
      );
    }
  }

  protected updateVolume(change: SoundEffectVolumeChange): void {
    if (change.volume < 0 || change.volume > 1) {
      return;
    }
    this.soundEffectStore.updateEffect({
      ...change.soundEffect,
      volume: change.volume,
    });
    const isPlaying = this.playingEffectIds().includes(change.soundEffect.id);
    if (isPlaying) {
      this.soundEffectPlayerService.setEffectVolume(
        change.soundEffect.id,
        change.volume
      );
    }
  }

  protected editSoundEffect(soundEffect: SoundEffect): void {
    const dialogRef = this.dialogService.open<
      SoundEffectEditModalComponent,
      EditSoundEffectResult
    >(SoundEffectEditModalComponent, { data: soundEffect });
    dialogRef.afterClosed$.pipe(take(1)).subscribe((result) => {
      if (!result || result.type === 'cancel') {
        return;
      }
      if (result.type === 'delete') {
        this.deleteSoundEffect(soundEffect);
        return;
      }
      if (result.type === 'update') {
        this.soundEffectStore.updateEffect(result.data);
      }
    });
  }

  protected deleteSoundEffect(soundEffect: SoundEffect): void {
    const data: ConfirmationDialogData = {
      title: 'Delete Sound Effect',
      message: `Are you sure you want to delete this sound effect: ${soundEffect.name}?`,
    };
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data,
    });
    dialogRef.afterClosed$.pipe(take(1)).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.soundEffectStore.deleteEffect(soundEffect.id);
    });
  }

  protected reorderSoundEffects(event: CdkDragDrop<SoundEffect[]>) {
    const soundEffects = this.paginatedSoundEffects();
    const soundEffect: SoundEffect | undefined =
      soundEffects[event.previousIndex];
    if (!soundEffect) {
      return;
    }

    const anchor = soundEffects[event.currentIndex];
    const placement =
      event.currentIndex > event.previousIndex
        ? DisplayOrderPlacement.AFTER
        : DisplayOrderPlacement.BEFORE;

    this.soundEffectStore.changeRelativeOrder({
      soundEffectId: soundEffect.id,
      anchorId: anchor?.id,
      placement,
    });

    this.soundEffects.update((soundEffects) => {
      const newSoundEffects = [...soundEffects];
      const fromIndex = newSoundEffects.findIndex(
        (s) => s.id === soundEffect.id
      );
      if (fromIndex === -1) {
        return newSoundEffects;
      }

      let toIndex: number;
      if (!anchor) {
        toIndex =
          placement === DisplayOrderPlacement.BEFORE
            ? 0
            : newSoundEffects.length - 1;
      } else {
        const anchorIndex = newSoundEffects.findIndex(
          (s) => s.id === anchor.id
        );
        if (anchorIndex === -1) {
          return newSoundEffects;
        }
        toIndex = anchorIndex;
      }

      moveItemInArray(newSoundEffects, fromIndex, toIndex);
      return newSoundEffects;
    });
  }

  beginUploadWithDialogSelection(): void {
    this.audioFilesService
      .openAudioFileDialog()
      .subscribe((audioFiles: AudioTrack[]) => {
        this.createFromFiles(audioFiles);
      });
  }

  updatePaginationPage(event: PageEvent): void {
    this.paginationService.pageSize.set(event.pageSize);
    this.paginationService.goToPage(event.pageIndex);
  }

  private orderSoundEffects(
    soundEffects: SoundEffect[],
    orderMap: Map<string, DisplayOrder> | undefined
  ) {
    if (!orderMap) {
      return soundEffects;
    }

    return [...soundEffects].sort((a, b) => {
      const orderA = orderMap.get(a.id)?.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.id)?.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }
}

export type SoundEffectVolumeChange = {
  soundEffect: SoundEffect;
  volume: number;
};
