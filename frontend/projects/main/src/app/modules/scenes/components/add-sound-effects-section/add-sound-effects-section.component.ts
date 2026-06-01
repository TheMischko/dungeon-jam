import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { DialogService } from '../../../../services/dialog.service';
import { SelectSoundEffectsModalComponent } from '../../../sound-effects/modals/select-sound-effects-modal/select-sound-effects-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectSoundEffectsSelection } from '../../../sound-effects/modals/select-sound-effects-modal/select-sound-effects-modal.types';

@Component({
  selector: 'app-add-sound-effects-section',
  imports: [],
  templateUrl: './add-sound-effects-section.component.html',
  styleUrl: './add-sound-effects-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSoundEffectsSectionComponent {
  readonly dialogService = inject(DialogService);
  readonly destroyRef = inject(DestroyRef);

  readonly soundEffectType = input<'ambience' | 'stinger'>('ambience');

  readonly soundEffectsAdd = output<SoundEffect[]>();

  readonly textMessage = computed<string>(() => {
    const entity =
      this.soundEffectType() === 'ambience' ? 'Ambience' : 'Stingers';
    return `${entity} is empty. Click here to add new ${entity}.`;
  });

  protected openSoundEffectSelection() {
    const dialog = this.dialogService.open<
      SelectSoundEffectsModalComponent,
      SelectSoundEffectsSelection
    >(SelectSoundEffectsModalComponent, {
      data: {
        selectedSoundEffects: [],
      },
    });

    dialog.afterClosed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: SelectSoundEffectsSelection | undefined) => {
        const soundEffects = response?.selectedSoundEffects;
        if (!soundEffects?.length) {
          return;
        }
        this.soundEffectsAdd.emit(soundEffects);
      });
  }
}
