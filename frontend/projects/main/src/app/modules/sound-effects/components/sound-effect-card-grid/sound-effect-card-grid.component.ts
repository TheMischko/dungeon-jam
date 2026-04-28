import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';

@Component({
  selector: 'app-sound-effect-card-grid',
  imports: [],
  templateUrl: './sound-effect-card-grid.component.html',
  styleUrl: './sound-effect-card-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectCardGridComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);

  /**
   * List of currently playing Sound Effect's IDs.
   */
  readonly currentlyPlaying = input<string[]>([]);

  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
}
