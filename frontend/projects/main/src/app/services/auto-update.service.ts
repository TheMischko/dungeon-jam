import { DestroyRef, inject, Service } from '@angular/core';
import { UpdateApiWindow } from '@general/models/api/update-api.model';
import { DialogService } from './dialog.service';
import { Observable, of, Subject, switchMap } from 'rxjs';
import { AppUpdateInfo } from '@shared/models/application.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PendingUpdatesModalComponent } from '../components/modals/pending-updates-modal/pending-updates-modal.component';

@Service()
export class AutoUpdateService {
  private readonly window = <UpdateApiWindow>window;
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);

  fetchAndShowUpdates(): void {
    this.getUpdateInfo()
      .pipe(
        switchMap((updates) => {
          if (!updates) {
            return of(void 0);
          }

          const dialog = this.dialogService.open(PendingUpdatesModalComponent, {
            width: '700px',
            hasBackdrop: true,
            data: { updates },
          });
          return dialog.afterClosed$.pipe(
            switchMap((result) => {
              if (!result) {
                return of(void 0);
              }
              return this.installUpdates();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
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
}
