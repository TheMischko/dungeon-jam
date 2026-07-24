import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { Tag } from '@shared/models/tag.model';
import { ScrollOverflowTextDirective } from '@general/directives/scroll-overflow-text.directive';
import {
  BigSizeGridItemConfig,
  GridItemSizeConfig,
} from '../../../models/grid.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-grid-item',
  imports: [LucideAngularModule, ScrollOverflowTextDirective, NgStyle],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridItemComponent {
  readonly title = input.required<string>();
  readonly tags = input<Tag[]>();
  readonly leftCornerText = input<string>();
  readonly rightCornerText = input<string>();
  readonly noImageIcon = input.required<LucideIconData>();
  readonly image = input<string | null>(null);
  readonly sizeConfig = input<GridItemSizeConfig>(BigSizeGridItemConfig);

  readonly clicked = output<void>();

  readonly isHovering = signal(false);

  readonly imageSizeStyle = computed<Record<string, string>>(() => {
    const size = `${this.sizeConfig().imageSize ?? 250}px`;
    return {
      width: size,
      height: size,
    };
  });
  readonly fallbackIconSize = computed<number>(() => {
    return this.sizeConfig().imageSize / 2;
  });
  readonly titleSizeStyle = computed<Record<string, unknown>>(() => {
    const sizeConfig = this.sizeConfig();
    return {
      'font-weight': sizeConfig.titleBold ? 'bold' : 'normal',
      'font-size': `${sizeConfig.titleSize}px`,
      'max-width': `${(sizeConfig.imageSize ?? 250) - 10}px`,
    };
  });

  protected onMouseEnter() {
    this.isHovering.set(true);
  }
  protected onMouseLeave() {
    this.isHovering.set(false);
  }
}
