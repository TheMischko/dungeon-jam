import { DestroyRef, inject, Service } from '@angular/core';
import { UpdateApiWindow } from '@general/models/api/update-api.model';
import { DialogService } from './dialog.service';
import { forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import {
  AppUpdateInfo,
  UpdatePreferences,
} from '@shared/models/application.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PendingUpdatesModalComponent } from '../components/modals/pending-updates-modal/pending-updates-modal.component';

@Service()
export class AutoUpdateService {
  private readonly window = <UpdateApiWindow>window;
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);

  private readonly MONTH_MILLI = 2592000000;

  fetchAndShowUpdates(): Observable<void> {
    return this.getUpdateInfo().pipe(
      switchMap((updates) => {
        if (!updates || updates.length === 0) {
          return of(void 0);
        }
        return this.openPendingUpdatesDialog(updates);
      })
    );
  }

  showUpdatesIfNotSkipped(): Observable<void> {
    return forkJoin([this.getUpdateInfo(), this.getPreferences()]).pipe(
      switchMap((values) => {
        const [update, preferences] = values;

        if (!update?.[0]) {
          return of(void 0);
        }
        const isSkipped = update[0].version === preferences.skippedVersion;

        if (isSkipped && preferences?.skippedVersionDate) {
          const skippedTime = new Date(
            preferences.skippedVersionDate
          ).getTime();
          const isSkipExpired =
            !isNaN(skippedTime) && Date.now() - skippedTime >= this.MONTH_MILLI;

          if (!isSkipExpired) {
            return of(void 0);
          }
        }

        return this.openPendingUpdatesDialog(update);
      })
    );
  }

  private openPendingUpdatesDialog(updates: AppUpdateInfo[]): Observable<void> {
    const dialog = this.dialogService.open(PendingUpdatesModalComponent, {
      width: '700px',
      hasBackdrop: true,
      data: { updates },
    });
    return dialog.afterClosed$.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((result) => {
        if (!result) {
          return this.cancelUpdate();
        }
        return this.installUpdates();
      })
    );
  }

  private getUpdateInfo(): Observable<AppUpdateInfo[] | null> {
    const response = new Subject<AppUpdateInfo[] | null>();
    this.window.UPDATE_API.getUpdateInfo()
      .then((data: AppUpdateInfo[]) => {
        if (!data.length) {
          response.next(null);
          response.complete();
          return;
        }
        response.next(data);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });
    return response.asObservable();
  }

  private installUpdates(): Observable<void> {
    const response = new Subject<void>();
    this.window.UPDATE_API.updateApp()
      .then(() => {
        response.next();
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });
    return response.asObservable();
  }

  private getPreferences(): Observable<UpdatePreferences> {
    const response = new Subject<UpdatePreferences>();
    this.window.UPDATE_API.getPreferences()
      .then((data) => {
        response.next(data);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });
    return response.asObservable();
  }

  private cancelUpdate(): Observable<void> {
    const response = new Subject<void>();
    this.window.UPDATE_API.skipVersion()
      .then(() => {
        response.next();
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });
    return response.asObservable();
  }
}
