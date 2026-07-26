import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { QueryRequest } from '@shared/models/request.model';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectSoundEffectsSelection } from './select-sound-effects-modal.types';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { SoundEffectTableComponent } from '../../components/sound-effect-table/sound-effect-table.component';
import { AudioPlayerService } from '../../../../services/audio-player.service';
import { soundEffectToTrack } from '@general/utils/sound-effect-to-track';

@Component({
  selector: 'app-select-sound-effects-modal',
  imports: [FormsModule, MatButton, SoundEffectTableComponent],
  providers: [AudioPlayerService],
  templateUrl: './select-sound-effects-modal.component.html',
  styleUrl: './select-sound-effects-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSoundEffectsModalComponent implements OnDestroy {
  readonly soundEffectStore = inject(SoundEffectStore);
  readonly audioPlayerService = inject(AudioPlayerService);
  readonly dialogRef =
    inject<MatDialogRef<SelectSoundEffectsSelection>>(MatDialogRef);
  readonly data = inject<SelectSoundEffectsSelection>(MAT_DIALOG_DATA);

  readonly soundEffects = computed(() => {
    return this.soundEffectStore
      .entities()
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly loading = this.soundEffectStore.loading;

  readonly selection = signal<SoundEffect[]>([]);
  readonly selectAllState = signal<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );

  readonly currentlyPlaying = signal<SoundEffect | undefined>(undefined);
  readonly currentlyPlayingList = computed<string[]>(() => {
    const current = this.currentlyPlaying();
    return current ? [current.id] : [];
  });

  readonly currentQuery = computed<QueryRequest>(() => {
    return {};
  });

  constructor() {
    this.soundEffectStore.loadAll(this.currentQuery);
    if (this.data.selectedSoundEffects) {
      this.selection.set(this.data.selectedSoundEffects);
    }
  }

  ngOnDestroy() {
    this.stopEffect();
  }

  selectionChanged = (selectedEffects: SoundEffect[]) => {
    if (selectedEffects.length === this.soundEffects().length) {
      this.selectAllState.set('checked');
    } else if (this.selectAllState() === 'checked') {
      this.selectAllState.set('indeterminate');
    }
    if (selectedEffects.length === 0) {
      this.selectAllState.set('unchecked');
    }
    this.selection.set(selectedEffects);
  };

  cancelClick() {
    this.dialogRef.close(undefined);
  }

  saveSelection() {
    this.dialogRef.close({
      selectedSoundEffects: this.selection(),
    });
  }

  protected async playEffect(soundEffect: SoundEffect) {
    if (this.currentlyPlaying()) {
      this.stopEffect();
    }
    await this.audioPlayerService.play(soundEffectToTrack(soundEffect));
    this.currentlyPlaying.set(soundEffect);
    if (soundEffect.duration > 60) {
      this.audioPlayerService.seek(30);
    } else {
      this.audioPlayerService.seek(1);
    }
  }

  protected stopEffect() {
    this.audioPlayerService.stop();
    this.currentlyPlaying.set(undefined);
  }
}
