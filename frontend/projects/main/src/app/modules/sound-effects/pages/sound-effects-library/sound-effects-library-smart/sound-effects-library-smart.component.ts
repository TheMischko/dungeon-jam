import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { SoundEffectsLibraryComponent } from '../sound-effects-library.component';
import { AudioTrack } from '@shared/models/track.model';
import { NewSoundEffectUploadService } from '../../../services/new-sound-effect-upload.service';
import { take } from 'rxjs';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SoundEffectsPlayerService } from '../../../../../services/sound-effects-player.service';
import { toSignal } from '@angular/core/rxjs-interop';

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

  private readonly playingEffects = toSignal(
    this.soundEffectPlayerService.playingEffects$,
    { initialValue: [] }
  );
  readonly playingEffectIds = computed(() =>
    this.playingEffects().map((e) => e.id)
  );

  readonly soundEffects = this.soundEffectStore.entities;
  readonly loading = this.soundEffectStore.loading;

  ngOnInit() {
    this.soundEffectStore.loadAll();
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

  protected toggleEffectLoop(soundEffect: SoundEffect) {
    console.log('toggleEffectLoop', soundEffect);
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
}
