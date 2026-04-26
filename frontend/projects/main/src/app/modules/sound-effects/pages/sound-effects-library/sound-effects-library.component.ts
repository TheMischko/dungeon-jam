import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { SongsDropInZoneComponent } from '../../../library/pages/library-landing-page/songs-drop-in-zone/songs-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';

@Component({
  selector: 'app-sound-effects-library',
  imports: [SongsDropInZoneComponent],
  templateUrl: './sound-effects-library.component.html',
  styleUrl: './sound-effects-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsLibraryComponent {
  readonly dataset = input<SoundEffect[]>([]);
  readonly loading = input<boolean>(false);

  readonly uploadAudioFiles = output<AudioTrack[]>();
}
