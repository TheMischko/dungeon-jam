import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';

@Component({
  selector: 'app-sound-effect-pill-icon-button',
  imports: [LucideDynamicIcon],
  templateUrl: './sound-effect-pill-icon-button.component.html',
  styleUrl: './sound-effect-pill-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectPillIconButtonComponent {
  readonly icon = input<LucideIconData>(actionsIconSet.CrossIcon);
  readonly clicked = output<void>();

  protected handleClick(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.clicked.emit();
  }
}
