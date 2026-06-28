import { Component, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import { NgClass } from '@angular/common';
import { ToastData, ToastType } from '../../../../models/toast.model';

@Component({
  selector: 'app-toast',
  imports: [IconButtonComponent, NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly data: ToastData = inject(MAT_SNACK_BAR_DATA);
  readonly toastRef = inject(MatSnackBarRef);
  readonly dismissIcon = actionsIconSet.CrossIcon;

  hideToast() {
    this.toastRef.dismiss();
  }

  getToastTypeClass() {
    switch (this.data.type) {
      case ToastType.Error:
        return 'error';
      default:
        return 'success';
    }
  }
}
