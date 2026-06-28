import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastComponent } from '../components/toast/toast.component';
import { ToastData, ToastType } from '../../../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

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
