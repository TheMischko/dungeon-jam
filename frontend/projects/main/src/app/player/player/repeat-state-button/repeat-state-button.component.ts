import { Component, computed, input, output } from '@angular/core';
import { iconSet } from '@general/icons/icons';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { ButtonSize } from '../../../../../../general/models/button.model';
import { NgClass } from '@angular/common';
import { RepeatState } from '@shared/models/track.model';

@Component({
  selector: 'app-repeat-state-button',
  imports: [IconButtonComponent, NgClass],
  templateUrl: './repeat-state-button.component.html',
  styleUrl: './repeat-state-button.component.scss',
})
export class RepeatStateButtonComponent {
  readonly repeatState = input<RepeatState>(RepeatState.NONE);
  readonly size = input<ButtonSize>('regular');
  readonly clicked = output<void>();

  readonly buttonClass = computed(() => {
    const state = this.repeatState();
    switch (true) {
      case state === RepeatState.ALL:
        return 'all';
      case state === RepeatState.SINGLE:
        return 'single';
      default:
        return 'none';
    }
  });
  readonly showSingleIndicator = computed(
    () => this.repeatState() === RepeatState.SINGLE
  );

  readonly RepeatIcon = iconSet.RepeatIcon;
}
