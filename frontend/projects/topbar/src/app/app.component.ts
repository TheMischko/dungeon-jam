import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationStateService } from '@general/services/application-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { addAppInitClass } from '@general/utils/add-app-init-class';
import { WindowControlsComponent } from './window-controls/window-controls.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WindowControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly applicationStateService = inject(ApplicationStateService);

  readonly applicationReady = toSignal(
    this.applicationStateService.applicationReady$.pipe(
      tap((ready) => addAppInitClass(ready))
    )
  );

  title = 'topbar';
}
