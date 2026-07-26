import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { AppNotification, AppNotificationType } from '@shared/models/notification.model';
import { NotificationApiWindow } from '../../../models/api/notification-api.model';
import { ToastType } from '../../../models/toast.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  private readonly window = window as NotificationApiWindow;
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  constructor() {
    this.window.NOTIFICATION_API.onNotification((notification: AppNotification) => {
      this.handleNotification(notification);
    });
  }

  private handleNotification(notification: AppNotification): void {
    if (notification.type === AppNotificationType.Error) {
      this.toastService.createAppErrorToast(notification.error);
      return;
    }
    const message = this.translateService.instant(
      notification.messageKey,
      notification.payload as Record<string, unknown>
    );
    const toastType =
      notification.type === AppNotificationType.Success
        ? ToastType.Success
        : ToastType.Info;
    this.toastService.createToast('', message, toastType);
  }
}
