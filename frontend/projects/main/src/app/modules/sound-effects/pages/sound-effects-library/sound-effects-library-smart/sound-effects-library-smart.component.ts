import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
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

@Component({
  selector: 'app-sound-effects-library-smart',
  imports: [SoundEffectsLibraryComponent],
  templateUrl: './sound-effects-library-smart.component.html',
  styleUrl: './sound-effects-library-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsLibrarySmartComponent implements OnInit {
  private readonly soundEffectStore = inject(SoundEffectStore);
  private readonly newSoundEffectUploadService = inject(
    NewSoundEffectUploadService
  );
  private readonly soundEffectPlayerService = inject(SoundEffectsPlayerService);
  private readonly dialogService = inject(DialogService);

  private readonly playingEffects = toSignal(
    this.soundEffectPlayerService.playingEffects$,
    { initialValue: [] }
  );
  readonly playingEffectIds = computed(() =>
    this.playingEffects().map((e) => e.id)
  );

  readonly currentQueryOptions = signal<QueryOptions>({
    sortBy: 'name',
    sortDirection: SortDirection.ASC,
  });
  readonly soundEffects = this.soundEffectStore.entities;
  readonly loading = this.soundEffectStore.loading;

  ngOnInit(): void {
    this.soundEffectStore.loadAll(this.currentQueryOptions);
  }

  createFromFiles(audioTracks?: AudioTrack[]): void {
    console.log('Create sound effects', audioTracks);
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
    console.log('Edit soundEffect', soundEffect);
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
}

export type SoundEffectVolumeChange = {
  soundEffect: SoundEffect;
  volume: number;
};
