import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { MatMenuItem } from '@angular/material/menu';

@Component({
  selector: 'lib-actions-menu',
  imports: [LucideAngularModule, MatMenuItem],
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

export type ActionsMenuBaseConfig<T> = {
  text: string;
  icon?: LucideIconData;
  onSelected?: (item: T, config: ActionsMenuBaseConfig<T>) => void;
  keepOpen?: boolean;
};
export type ActionsMenuDataConfig<T, V> = ActionsMenuBaseConfig<T> & {
  data?: V;
};
export type ActionsMenuConfig<T, V> =
  | ActionsMenuBaseConfig<T>
  | ActionsMenuDataConfig<T, V>;
