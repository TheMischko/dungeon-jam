import { inject, Injectable } from '@angular/core';
import { ToastService } from '@general/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { AppError } from '@shared/models/error.model';
import { ToastType } from '@general/models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistToastService {
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  showLoadError(error: AppError): void {
    this.toastService.createAppErrorToast(error, 'Loading playlist error');
  }

  showInsertError(error: AppError): void {
    this.toastService.createAppErrorToast(error, 'Insert playlist error');
  }

  showInsertSuccess(playlistName: string): void {
    this.toastService.createToast(
      'Playlist created',
      `"${playlistName}" was created.`,
      ToastType.Success
    );
  }

  showUpdateError(error: AppError): void {
    this.toastService.createAppErrorToast(error, 'Update playlist error');
  }

  showUpdateSuccess(playlistName: string): void {
    this.toastService.createToast(
      'Playlist updated',
      `"${playlistName}" was updated.`,
      ToastType.Success
    );
  }

  showTracksAddedError(error: AppError): void {
    this.toastService.createAppErrorToast(error, 'Adding tracks error');
  }

  showTracksAddedSuccess(): void {
    this.toastService.createToast('Tracks added', undefined, ToastType.Success);
  }

  showDeleteError(error: AppError): void {
    this.toastService.createAppErrorToast(error, 'Delete playlist error');
  }

  showDeleteSuccess(): void {
    this.toastService.createToast(
      'Playlist deleted',
      'Playlist was successfully deleted.',
      ToastType.Success
    );
  }
}
