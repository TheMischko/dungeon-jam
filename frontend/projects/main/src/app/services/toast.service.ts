import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastComponent } from '../components/toast/toast.component';
import { ToastData, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly snackBarConfig: Partial<MatSnackBarConfig> = {
    horizontalPosition: 'end',
    verticalPosition: 'top',
    direction: 'ltr',
  };

  createToast(title: string, message: string, type: ToastType): void {
    this.snackBar.openFromComponent<ToastComponent, ToastData>(ToastComponent, {
      data: this.createToastData(title, message, type),
      ...this.snackBarConfig,
    });
  }

  private createToastData(
    title: string,
    message: string,
    type: ToastType,
  ): ToastData {
    return {
      title,
      description: message,
      type,
    };
  }
}
