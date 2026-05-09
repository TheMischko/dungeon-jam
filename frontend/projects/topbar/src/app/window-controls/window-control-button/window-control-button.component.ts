import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-window-control-button',
  imports: [LucideAngularModule],
  templateUrl: './window-control-button.component.html',
  styleUrl: './window-control-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowControlButtonComponent {
  readonly icon = input<LucideIconData>();
}
