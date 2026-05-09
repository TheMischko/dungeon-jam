import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ApplicationStateService } from '@general/services/application-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { OperatingSystem } from '@shared/models/application.model';
import { WindowControlButtonComponent } from './window-control-button/window-control-button.component';
import { actionsIconSet } from '@general/icons/icons';

@Component({
  selector: 'app-window-controls',
  imports: [WindowControlButtonComponent],
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowControlsComponent {
  private readonly applicationStateService = inject(ApplicationStateService);

  readonly operatingSystem = toSignal(
    this.applicationStateService.operatingSystem$,
    { initialValue: undefined }
  );
  readonly showControls = computed(() => {
    const os = this.operatingSystem();
    return os !== undefined && os !== OperatingSystem.MacOS;
  });
  readonly showUnmaximizeButton = toSignal(
    this.applicationStateService.isMaximized$,
    { initialValue: false }
  );

  readonly MinimizeIcon = actionsIconSet.MinimizeIcon;
  readonly MaximizeIcon = actionsIconSet.MaximizeIcon;
  readonly UnmaximizeIcon = actionsIconSet.UnmaximizeIcon;
  readonly CloseIcon = actionsIconSet.CloseAppIcon;

  closeApp() {
    this.applicationStateService.closeApp();
  }

  minimize() {
    this.applicationStateService.minimizeApp();
  }

  maximize() {
    this.applicationStateService.maximizeApp();
  }

  unmaximize() {
    this.applicationStateService.unmaximizeApp();
  }
}
