import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Scene } from '@shared/models/scene.model';
import { ScenesGridSmartComponent } from '../../components/scenes-grid-smart/scenes-grid-smart.component';
import { GridSizePreset } from '../../../../models/grid.model';

@Component({
  selector: 'app-scenes-landing',
  imports: [MatButton, ScenesGridSmartComponent],
  templateUrl: './scenes-landing.component.html',
  styleUrl: './scenes-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenesLandingComponent {
  readonly scenes = input<Scene[]>([]);
  readonly loading = input<boolean>(false);

  readonly insertNew = output<void>();

  readonly defaultSizeIndex = GridSizePreset.Big;
}
