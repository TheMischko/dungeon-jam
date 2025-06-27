import { Component, computed, input, output } from '@angular/core';
import { ButtonSize, ButtonType } from '../../../../../models/button.model';
import { MatButton } from '@angular/material/button';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'lib-icon-button',
  imports: [MatButton, NgTemplateOutlet, LucideAngularModule, NgClass],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.css',
})
export class IconButtonComponent {
  readonly icon = input.required<LucideIconData>();
  readonly color = input<string>('primary');
  readonly disabled = input<boolean>(false);
  readonly type = input<ButtonType>(ButtonType.Default);
  readonly size = input<ButtonSize>('regular');

  readonly clicked = output<void>();

  readonly iconClass = computed(() => `icon-${this.size()}`);
  readonly buttonClass = computed(() => [
    `button-${this.size()}`,
    'icon-button',
  ]);
  readonly iconSize = computed(() => {
    const size = this.size();
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  });

  buttonClicked() {
    this.clicked.emit();
  }

  protected readonly ButtonType = ButtonType;
}
