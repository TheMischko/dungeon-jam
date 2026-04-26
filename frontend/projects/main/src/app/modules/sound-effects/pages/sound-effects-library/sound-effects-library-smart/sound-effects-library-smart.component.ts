import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { SoundEffectStore } from '@general/stores/sound-effect.store';
import { SoundEffectsLibraryComponent } from '../sound-effects-library.component';
import { AudioTrack } from '@shared/models/track.model';
import { NewSoundEffectUploadService } from '../../../services/new-sound-effect-upload.service';
import { take } from 'rxjs';

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
}
