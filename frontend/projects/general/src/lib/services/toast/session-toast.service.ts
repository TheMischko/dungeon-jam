import { inject, Injectable } from '@angular/core';
import { ToastService } from '@general/services/toast.service';
import { AppError } from '@shared/models/error.model';
import { ToastType } from '../../../../models/toast.model';
import { isAppError } from '@shared/utils/is-app-error';
import { SessionData } from '@shared/models/session.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class SessionToastService {
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  showLoadAllError(error: AppError): void {
    if (isAppError(error)) {
      this.toastService.createAppErrorToast(error, this.translateService.instant('NOTIFICATIONS.SESSION.LOAD_ALL_ERROR_TITLE'));
      return;
    }
    this.showUnknownError(error, this.translateService.instant('NOTIFICATIONS.SESSION.LOAD_ALL_ERROR_TITLE'));
  }

  showInsertError(error: AppError): void {
    if (isAppError(error)) {
      this.toastService.createAppErrorToast(error, this.translateService.instant('NOTIFICATIONS.SESSION.INSERT_ERROR_TITLE'));
      return;
    }
    this.showUnknownError(error, this.translateService.instant('NOTIFICATIONS.SESSION.INSERT_ERROR_TITLE'));
  }

  showInsertSuccess(session: SessionData): void {
    this.toastService.createToast(
      this.translateService.instant('NOTIFICATIONS.SESSION.INSERT_SUCCESS_TITLE'),
      this.translateService.instant('NOTIFICATIONS.SESSION.INSERT_SUCCESS_MESSAGE', { name: session.name }),
      ToastType.Success
    );
  }

  showUpdateError(error: AppError): void {
    if (isAppError(error)) {
      this.toastService.createAppErrorToast(error, this.translateService.instant('NOTIFICATIONS.SESSION.UPDATE_ERROR_TITLE'));
      return;
    }
    this.showUnknownError(error, this.translateService.instant('NOTIFICATIONS.SESSION.UPDATE_ERROR_TITLE'));
  }

  showUpdateSuccess(session: SessionData): void {
    this.toastService.createToast(
      this.translateService.instant('NOTIFICATIONS.SESSION.UPDATE_SUCCESS_TITLE'),
      this.translateService.instant('NOTIFICATIONS.SESSION.UPDATE_SUCCESS_MESSAGE', { name: session.name }),
      ToastType.Success
    );
  }

  showDeleteError(error: AppError): void {
    if (isAppError(error)) {
      this.toastService.createAppErrorToast(error, this.translateService.instant('NOTIFICATIONS.SESSION.DELETE_ERROR_TITLE'));
      return;
    }
    this.showUnknownError(error, this.translateService.instant('NOTIFICATIONS.SESSION.DELETE_ERROR_TITLE'));
  }

  showDeleteSuccess(): void {
    this.toastService.createToast(
      this.translateService.instant('NOTIFICATIONS.SESSION.DELETE_SUCCESS_TITLE'),
      this.translateService.instant('NOTIFICATIONS.SESSION.DELETE_SUCCESS_MESSAGE'),
      ToastType.Success
    );
  }

  private showUnknownError(error: Error, title: string): void {
    this.toastService.createToast(title, this.translateService.instant('NOTIFICATIONS.SESSION.GENERIC_ERROR_MESSAGE'), ToastType.Error);
  }
}
