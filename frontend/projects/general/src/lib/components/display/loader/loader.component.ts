import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { iconSet } from '@general/icons/icons';

@Component({
  selector: 'lib-loader',
  imports: [LucideDynamicIcon],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  readonly size = input<'small' | 'medium' | 'large'>('small');
  readonly center = input<boolean>(false);

  readonly loadingIcon = iconSet.LoadingIcon;
  readonly sizeMap = {
    small: 18,
    medium: 38,
    large: 56,
  };
  readonly sizeValue = computed<number>(() => {
    return this.sizeMap[this.size()];
  });
}
