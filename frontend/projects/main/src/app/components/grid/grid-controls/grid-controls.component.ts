import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { iconSet } from '@general/icons/icons';

@Component({
  selector: 'app-grid-controls',
  imports: [RangeSliderComponent, SearchBarComponent],
  templateUrl: './grid-controls.component.html',
  styleUrl: './grid-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridControlsComponent {
  readonly showSizeControl = input<boolean>(true);
  readonly sizeMaxValue = input<number>(100);
  readonly currentValue = input<number>(75);
  readonly stepSize = input<number>(5);

  readonly search = output<string>();
  readonly sizeChange = output<number>();

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;

  sizeInput(value: number) {
    this.sizeChange.emit(value / 100);
  }
}
