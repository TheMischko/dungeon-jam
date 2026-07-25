import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ApplicationStateService } from '@general/services/application-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { addAppInitClass } from '@general/utils/add-app-init-class';
import { WindowControlsComponent } from './window-controls/window-controls.component';
import { OperatingSystem } from '@shared/models/application.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [WindowControlsComponent, NgStyle],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly applicationStateService = inject(ApplicationStateService);

  readonly applicationReady = toSignal(
    this.applicationStateService.applicationReady$.pipe(
      tap((ready) => addAppInitClass(ready))
    )
  );

  readonly offsetTitleForMacOS = toSignal(
    this.applicationStateService.operatingSystem$.pipe(
      map((os) => os === OperatingSystem.MacOS)
    ),
    { initialValue: false }
  );

  readonly titleStyles = computed<Record<string, string>>(() => {
    const offset = this.offsetTitleForMacOS();
    return {
      ...(offset && {
        'padding-left': '80px',
      }),
    };
  });

  title = 'topbar';
}
