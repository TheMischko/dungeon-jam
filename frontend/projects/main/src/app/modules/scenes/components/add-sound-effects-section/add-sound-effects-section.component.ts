import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';

@Component({
  selector: 'app-add-sound-effects-section',
  imports: [],
  templateUrl: './add-sound-effects-section.component.html',
  styleUrl: './add-sound-effects-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSoundEffectsSectionComponent {
  readonly soundEffectType = input<'ambience' | 'stinger'>('ambience');

  readonly soundEffectsAdd = output<SoundEffect[]>();

  readonly textMessage = computed<string>(() => {
    const entity =
      this.soundEffectType() === 'ambience' ? 'Ambience' : 'Stingers';
    return `${entity} is empty. Click here to add new ${entity}.`;
  });

  protected openSoundEffectSelection() {}
}
