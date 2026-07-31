import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';
import { Tag } from '@shared/models/tag.model';
import { ScrollOverflowTextDirective } from '@general/directives/scroll-overflow-text.directive';
import {
  BigSizeGridItemConfig,
  GridItemSizeConfig,
} from '../../../models/grid.model';
import { NgStyle } from '@angular/common';
import {
  ActionsMenuComponent,
  ActionsMenuConfig,
} from '@general/components/display/actions-menu/actions-menu.component';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-grid-item',
  imports: [
    LucideDynamicIcon,
    ScrollOverflowTextDirective,
    NgStyle,
    IconButtonComponent,
    ActionsMenuComponent,
    MatMenuTrigger,
    MatMenu,
  ],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridItemComponent<T> {
  readonly title = input.required<string>();
  readonly tags = input<Tag[]>();
  readonly leftCornerText = input<string>();
  readonly rightCornerText = input<string>();
  readonly noImageIcon = input.required<LucideIconData>();
  readonly image = input<string | null>(null);
  readonly sizeConfig = input<GridItemSizeConfig>(BigSizeGridItemConfig);
  readonly dataItem = input<T>();
  readonly actions = input<ActionsMenuConfig<T, unknown>[]>([]);

  readonly clicked = output<void>();

  readonly isHovering = signal(false);
  readonly actionsIcon = actionsIconSet.ActionsMenu;

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

  protected preventClickBubbling(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
