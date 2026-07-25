import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonSize, ButtonType } from '../../../../../models/button.model';
import { MatButton } from '@angular/material/button';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'lib-icon-button',
  imports: [MatButton, NgTemplateOutlet, LucideAngularModule, NgClass],
  templateUrl: './icon-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  readonly icon = input.required<LucideIconData>();
  readonly label = input<string>();
  readonly color = input<string>('primary');
  readonly disabled = input<boolean>(false);
  readonly type = input<ButtonType>(ButtonType.Default);
  readonly size = input<ButtonSize>('regular');

  readonly clicked = output<void>();

  readonly materialColor = computed(() => {
    const color = this.color();
    // Only apply Material color if it's a valid Material color
    return color === 'primary' || color === 'accent' || color === 'warn'
      ? color
      : undefined;
  });

  readonly iconClass = computed(() => `icon-${this.size()}`);
  readonly buttonClass = computed(() => {
    const classes = [`button-${this.size()}`, 'icon-button'];
    if (this.color() === 'neutral') {
      classes.push('neutral-button');
    }
    if (this.label()) {
      classes.push('pill-button');
    } else {
      classes.push('icon-only-button');
    }
    return classes;
  });
  readonly iconSize = computed(() => {
    const size = this.size();
    switch (size) {
      case 'small':
        return 20;
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
