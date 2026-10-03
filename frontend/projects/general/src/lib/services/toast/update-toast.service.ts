import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastType } from '../../../../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class UpdateToastService {
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

  showUpToDate(): void {
    this.toastService.createToast(
      this.translateService.instant('NOTIFICATIONS.UPDATE.UP_TO_DATE_TITLE'),
      this.translateService.instant('NOTIFICATIONS.UPDATE.UP_TO_DATE_MESSAGE'),
      ToastType.Info
    );
  }

  showCheckFailed(): void {
    this.toastService.createToast(
      this.translateService.instant('NOTIFICATIONS.UPDATE.CHECK_FAILED_TITLE'),
      this.translateService.instant(
        'NOTIFICATIONS.UPDATE.CHECK_FAILED_MESSAGE'
      ),
      ToastType.Error
    );
  }
}
