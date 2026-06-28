import { ToastService } from '@general/services/toast.service';
import { ToastType } from '../../../models/toast.model';

export class ToastVoidService extends ToastService {
  override createToast(
    title: string,
    message: string | undefined,
    type: ToastType
  ): void {
    return;
  }

  override createAppErrorToast(): void {
    return;
  }
}
