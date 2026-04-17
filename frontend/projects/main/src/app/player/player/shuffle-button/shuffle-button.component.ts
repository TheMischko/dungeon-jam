import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';

@Component({
  selector: 'app-shuffle-button',
  imports: [
    IconButtonComponent,
  ],
  templateUrl: './shuffle-button.component.html',
  styleUrl: './shuffle-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuffleButtonComponent {
  readonly shuffleState = input<boolean>(false);
  readonly clicked = output<void>();

  readonly buttonClass = computed(() => this.shuffleState() ? 'active' : 'inactive');

  readonly shuffleIcon = actionsIconSet.ShuffleIcon;
}
