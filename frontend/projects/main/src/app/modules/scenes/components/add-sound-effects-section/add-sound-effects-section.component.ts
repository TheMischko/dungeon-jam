import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DialogService } from '../../../../services/dialog.service';

@Component({
  selector: 'app-add-sound-effects-section',
  imports: [],
  templateUrl: './add-sound-effects-section.component.html',
  styleUrl: './add-sound-effects-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSoundEffectsSectionComponent {
  readonly dialogService = inject(DialogService);

  readonly soundEffectType = input<'ambience' | 'stinger'>('ambience');

  readonly addSoundEffects = output<void>();

  readonly textMessage = computed<string>(() => {
    const entity =
      this.soundEffectType() === 'ambience' ? 'Ambience' : 'Stingers';
    return `${entity} is empty. Click here to add new ${entity}.`;
  });
}
