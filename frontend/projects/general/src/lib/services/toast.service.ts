import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastComponent } from '../components/toast/toast.component';
import { ToastData, ToastType } from '../../../models/toast.model';
import { AppError } from '@shared/models/error.model';
import { InterpolationParameters, TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);

  private readonly ErrorString: string =
    this.translateService.instant('COMMON.ERROR');

  private readonly snackBarConfig: Partial<MatSnackBarConfig> = {
    horizontalPosition: 'end',
    verticalPosition: 'top',
    direction: 'ltr',
    panelClass: 'notification-animation',
    duration: 3000,
  };

  private snackBarInProgress: boolean = false;
  private queue: ToastData[] = [];

  createToast(
    title: string,
    message: string | undefined,
    type: ToastType
  ): void {
    const data = this.createToastData(title, message, type);
    if (this.snackBarInProgress) {
      this.queue.push(data);
      return;
    }
    this.snackBarInProgress = true;
    const ref = this.snackBar.openFromComponent<ToastComponent, ToastData>(
      ToastComponent,
      {
        data,
        ...this.snackBarConfig,
      }
    );
    ref.afterDismissed().subscribe(() => this.pollQueue());
  }

  createAppErrorToast(error: AppError, title?: string): void {
    const message: string = this.translateService.instant(
      error.code,
      error.payload as InterpolationParameters
    );

    console.error(error);

    this.createToast(title ?? this.ErrorString, message, ToastType.Error);
  }

  private pollQueue() {
    const nextInQueue = this.queue.pop();
    if (!nextInQueue) {
      this.snackBarInProgress = false;
      return;
    }
    this.snackBarInProgress = true;
    const ref = this.snackBar.openFromComponent<ToastComponent, ToastData>(
      ToastComponent,
      {
        data: nextInQueue,
        ...this.snackBarConfig,
      }
    );
    ref.afterDismissed().subscribe(() => this.pollQueue());
  }

  private createToastData(
    title: string,
    message: string | undefined,
    type: ToastType
  ): ToastData {
    return {
      title,
      description: message,
      type,
    };
  }
}
