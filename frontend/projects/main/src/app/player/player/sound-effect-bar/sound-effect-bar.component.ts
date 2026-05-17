import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ActiveSoundEffect } from '../../../services/sound-effects-player.service';
import { SoundEffectBarPillComponent } from './sound-effect-bar-pill/sound-effect-bar-pill.component';
import { SoundEffect } from '@shared/models/sound-effect.model';

@Component({
  selector: 'app-sound-effect-bar',
  imports: [SoundEffectBarPillComponent],
  templateUrl: './sound-effect-bar.component.html',
  styleUrl: './sound-effect-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectBarComponent {
  readonly playingEffects = input<ActiveSoundEffect[]>();
  readonly playingEffectsPositions = input<Record<string, number>>();

  readonly stopSoundEffect = output<string>();
  readonly showDetail = output<SoundEffect>();
}
