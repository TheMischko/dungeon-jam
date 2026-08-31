import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { SoundEffect } from '@shared/models/sound-effect.model';
import { ActionsMenuBaseConfig } from '@general/components/display/actions-menu/actions-menu.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GridControlsComponent } from '../../../../components/grid/grid-controls/grid-controls.component';
import { SoundEffectDisplayModeSwitchComponent } from '../sound-effect-display-mode-switch/sound-effect-display-mode-switch.component';
import { SoundEffectCardGridComponent } from '../sound-effect-card-grid/sound-effect-card-grid.component';
import { SoundEffectTableComponent } from '../sound-effect-table/sound-effect-table.component';
import { SoundEffectVolumeChange } from '../../pages/sound-effects-library/sound-effects-library-smart/sound-effects-library-smart.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationConfig } from '../../../../models/pagination.model';

@Component({
  selector: 'app-sound-effects-display',
  imports: [
    GridControlsComponent,
    SoundEffectDisplayModeSwitchComponent,
    SoundEffectCardGridComponent,
    SoundEffectTableComponent,
    MatPaginator,
  ],
  templateUrl: './sound-effects-display.component.html',
  styleUrl: './sound-effects-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundEffectsDisplayComponent {
  readonly soundEffects = input.required<SoundEffect[]>();
  readonly loading = input<boolean>(false);
  readonly actionsMenu = input<ActionsMenuBaseConfig<SoundEffect>[]>([]);
  readonly currentlyPlaying = input<string[]>([]);
  readonly viewMode = input<'grid' | 'table'>('grid');
  readonly hideToggle = input<boolean>(false);
  readonly paginationConfig = input<PaginationConfig | undefined>(undefined);

  readonly selection = input<boolean>(false);
  readonly initialSelection = input<SoundEffect[]>();
  readonly allSelectedState = input<'checked' | 'unchecked' | 'indeterminate'>(
    'unchecked'
  );
  readonly hiddenColumns = input<string[]>([]);

  readonly search = output<string>();
  readonly modeChange = output<'grid' | 'table'>();
  readonly playEffect = output<SoundEffect>();
  readonly stopEffect = output<SoundEffect>();
  readonly toggleEffectLoop = output<SoundEffect>();
  readonly effectVolumeChange = output<SoundEffectVolumeChange>();
  readonly reorderDrop = output<CdkDragDrop<SoundEffect[]>>();
  readonly selectionChange = output<SoundEffect[]>();
  readonly pageChange = output<PageEvent>();

  readonly activeViewMode = linkedSignal(() => this.viewMode());
  readonly cardSize = signal<number>(0.75);

  protected onModeChange(newMode: 'grid' | 'table'): void {
    this.activeViewMode.set(newMode);
    this.modeChange.emit(newMode);
  }
}
