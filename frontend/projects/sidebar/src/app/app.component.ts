import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ApplicationStateService } from '@general/services/application-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { addAppInitClass } from '@general/utils/add-app-init-class';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
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
  title = 'sidebar';
}
