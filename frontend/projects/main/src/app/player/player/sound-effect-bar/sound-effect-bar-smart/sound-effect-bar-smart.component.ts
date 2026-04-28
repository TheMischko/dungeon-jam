import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SoundEffectsPlayerService } from '../../../../services/sound-effects-player.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SoundEffectBarComponent } from '../sound-effect-bar.component';

@Component({
  selector: 'app-sound-effect-bar-smart',
  imports: [SoundEffectBarComponent],
  templateUrl: './sound-effect-bar-smart.component.html',
  styleUrl: './sound-effect-bar-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectBarSmartComponent {
  readonly soundEffectsPlayerService = inject(SoundEffectsPlayerService);

  readonly playingEffects = toSignal(
    this.soundEffectsPlayerService.playingEffects$,
    { initialValue: [] }
  );
  readonly playingEffectsPositions = toSignal(
    this.soundEffectsPlayerService.effectPositions$,
    { initialValue: {} as Record<string, number> }
  );

  protected stopEffect(soundEffectId: string): void {
    this.soundEffectsPlayerService.stopEffect(soundEffectId);
  }
}
