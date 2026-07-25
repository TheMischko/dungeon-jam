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
import {
  AllSizeGridItemConfigs,
  GridItemSizeConfig,
} from '../../../../models/grid.model';
import { GridControlsComponent } from '../../../../components/grid/grid-controls/grid-controls.component';

@Component({
  selector: 'app-sessions-grid',
  imports: [GridItemComponent, GridControlsComponent],
  templateUrl: './sessions-grid.component.html',
  styleUrl: './sessions-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsGridComponent {
  readonly sessions = input.required<SessionData[]>();
  readonly loading = input<boolean>(false);
  readonly showControls = input<boolean>(true);
  readonly sizeConfig = input.required<GridItemSizeConfig>();
  readonly availableSizes = input<GridItemSizeConfig[]>(AllSizeGridItemConfigs);
  readonly currentSizeIndex = input<number>(0);
  readonly imageMap = input<Record<string, string | null>>();

  readonly sessionClick = output<SessionData>();
  readonly sizeChange = output<number>();
  readonly search = output<string>();

  readonly SessionIcon = iconSet.SessionIcon;

  readonly maxSizeIndex = computed<number>(() => {
    return Math.max(this.availableSizes().length - 1, 0);
  });

  protected sizeInput(value: number) {
    const index = Math.round(value * 100);
    const clampedIndex = Math.max(Math.min(index, this.maxSizeIndex()), 0);
    this.sizeChange.emit(clampedIndex);
  }

  protected getSessionImage(session: SessionData): string | null {
    return this.imageMap()?.[session.id] ?? null;
  }
}
