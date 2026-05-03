import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-sound-effect-display-mode-switch',
  imports: [MatSlideToggle],
  templateUrl: './sound-effect-display-mode-switch.component.html',
  styleUrl: './sound-effect-display-mode-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectDisplayModeSwitchComponent {
  readonly mode = input<'table' | 'grid'>();
  readonly modeChange = output<'table' | 'grid'>();

  readonly checked = computed(() => {
    return this.mode() === 'grid';
  });

  emitChange(toggled: MatSlideToggleChange) {
    const newMode = toggled.checked ? 'grid' : 'table';
    this.modeChange.emit(newMode);
  }
}
