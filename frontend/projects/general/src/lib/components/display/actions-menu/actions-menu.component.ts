import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconData } from '@lucide/angular';
import { MatMenuItem } from '@angular/material/menu';
import { NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'lib-actions-menu',
  imports: [LucideDynamicIcon, MatMenuItem, NgClass, MatTooltip],
  templateUrl: './actions-menu.component.html',
  styleUrl: './actions-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsMenuComponent<T> {
  readonly item = input.required<T>();
  readonly config = input.required<ActionsMenuBaseConfig<T>[]>();
  readonly title = input<string>();

  actionClicked(item: T, config: ActionsMenuBaseConfig<T>, event: Event): void {
    if (!config.onSelected || typeof config.onSelected !== 'function') {
      return;
    }
    if (config.keepOpen) {
      event.stopPropagation();
    }
    config.onSelected(item, config);
  }
}

export type ActionsMenuBaseConfig<T, K = string> = {
  key?: K;
  text: string;
  tooltip?: string;
  icon?: LucideIconData;
  onSelected?: (item: T, config: ActionsMenuBaseConfig<T>) => void;
  keepOpen?: boolean;
  cssClasses?: string[];
};
export type ActionsMenuDataConfig<T, V> = ActionsMenuBaseConfig<T> & {
  data?: V;
};
export type ActionsMenuConfig<T, V> =
  | ActionsMenuBaseConfig<T>
  | ActionsMenuDataConfig<T, V>;
