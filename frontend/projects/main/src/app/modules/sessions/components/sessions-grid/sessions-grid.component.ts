import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SessionData } from '@shared/models/session.model';
import { GridItemComponent } from '../../../../components/grid/grid-item/grid-item.component';
import { iconSet } from '@general/icons/icons';
import { SearchBarComponent } from '@general/components/controls/search-bar/search-bar.component';
import { RangeSliderComponent } from '@general/components/controls/range-slider/range-slider.component';
import {
  AllSizeGridItemConfigs,
  GridItemSizeConfig,
} from '../../../../models/grid.model';

@Component({
  selector: 'app-sessions-grid',
  imports: [GridItemComponent, SearchBarComponent, RangeSliderComponent],
  templateUrl: './sessions-grid.component.html',
  styleUrl: './sessions-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsGridComponent {
  readonly sessions = input.required<SessionData[]>();
  readonly loading = input<boolean>(false);
  readonly showControls = input<boolean>(true);
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly availableSizes = input<GridItemSizeConfig[]>(
    AllSizeGridItemConfigs
  );
  readonly currentSizeIndex = input<number>(0);

  readonly sessionClick = output<SessionData>();
  readonly sizeChange = output<number>();
  readonly search = output<string>();

  readonly gridBigIcon = iconSet.GridBigIcon;
  readonly gridSmallIcon = iconSet.GridSmallIcon;
  readonly SessionIcon = iconSet.SessionIcon;

  readonly maxSizeIndex = computed<number>(() => {
    return Math.max(this.availableSizes().length - 1, 0);
  });

  protected sizeInput(index: number) {
    this.sizeChange.emit(index);
  }
}
