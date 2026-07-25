import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { SoundEffectPillIconButtonComponent } from '../sound-effect-pill-stop-icon/sound-effect-pill-icon-button.component';
import { actionsIconSet } from '@general/icons/icons';

@Component({
  selector: 'app-sound-effect-control-pill',
  imports: [SoundEffectPillIconButtonComponent],
  templateUrl: './sound-effect-control-pill.component.html',
  styleUrl: './sound-effect-control-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectControlPillComponent {
  readonly expanded = input<boolean>(true);
  readonly soundEffectsCount = input<number>(0);

  readonly toggled = output<void>();
  readonly closed = output<void>();

  readonly closeEnabled = signal<boolean>(true);
  readonly toggleIcon = computed(() => {
    if (this.expanded()) {
      return this.expandedIcon;
    }
    return this.collapsedIcon;
  });

  readonly collapsedIcon = actionsIconSet.CollapsedArrowIcon;
  readonly expandedIcon = actionsIconSet.ExpandedArrowIcon;
  readonly stopIcon = actionsIconSet.CrossIcon;

  constructor() {
    effect(() => {
      const expanded = this.expanded();
      if (expanded) {
        return;
      }
      this.closeEnabled.set(false);
      setTimeout(() => {
        this.closeEnabled.set(true);
      }, 250);
    });
  }

  protected emitClose() {
    if (this.closeEnabled()) {
      this.closed.emit();
      return;
    }
  }
}
