import { Component, input, output } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { iconSet } from '../../../icons/icons';
import { ButtonSize, ButtonType } from '../../../../../models/button.model';

@Component({
  selector: 'lib-play-pause-button',
  imports: [IconButtonComponent],
  templateUrl: './play-pause-button.component.html',
  styleUrl: './play-pause-button.component.css',
})
export class PlayPauseButtonComponent {
  readonly size = input<ButtonSize>('regular');
  readonly state = input.required<'play' | 'pause'>();
  readonly toggle = output<'play' | 'pause'>();

  clicked() {
    this.toggle.emit(this.state());
  }

  readonly playIcon = iconSet.PlayIcon;
  readonly pauseIcon = iconSet.PauseIcon;
  protected readonly ButtonType = ButtonType;
}
