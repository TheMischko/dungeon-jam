import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { FilesDropInZoneComponent } from '../../../library/pages/library-landing-page/songs-drop-in-zone/files-drop-in-zone.component';
import { AudioTrack } from '@shared/models/track.model';
import { SoundEffectTableComponent } from '../../components/sound-effect-table/sound-effect-table.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SoundEffectCardGridComponent } from '../../components/sound-effect-card-grid/sound-effect-card-grid.component';
import { SoundEffectVolumeChange } from './sound-effects-library-smart/sound-effects-library-smart.component';

@Component({
  selector: 'app-sound-effects-library',
  imports: [
    FilesDropInZoneComponent,
    SoundEffectTableComponent,
    MatSlideToggle,
    SoundEffectCardGridComponent,
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

  readonly showGrid = signal<boolean>(true);
}
