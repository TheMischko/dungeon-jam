import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SongsDropInZoneComponent } from '../../../library/pages/library-landing-page/songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';
import { SoundEffectTableComponent } from '../../components/sound-effect-table/sound-effect-table.component';

@Component({
  selector: 'app-sound-effects-library',
  imports: [SongsDropInZoneComponent, SoundEffectTableComponent],
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
}
