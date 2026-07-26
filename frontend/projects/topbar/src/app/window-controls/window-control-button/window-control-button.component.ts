import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';

@Component({
  selector: 'app-window-control-button',
  imports: [LucideDynamicIcon],
  templateUrl: './window-control-button.component.html',
  styleUrl: './window-control-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowControlButtonComponent {
  readonly icon = input<LucideIconData>();
}
