import { ViewManager } from '../managers/view.manager';
import { NotificationChannel } from '@shared/models/channels.model';
import { AppError } from '@shared/models/error.model';
import {
  AppNotification,
  AppNotificationType,
  NotificationMessageKeyType,
} from '@shared/models/notification.model';

export async function broadcastNotification(
  notification: AppNotification
): Promise<void> {
  const viewManager = await ViewManager.getInstance();
  viewManager.broadcast(NotificationChannel.PUSH, undefined, notification);
}

export function createErrorNotification(error: AppError): AppNotification {
  return { type: AppNotificationType.Error, error };
}

export function createSuccessNotification(
  messageKey: NotificationMessageKeyType,
  payload?: unknown
): AppNotification {
  return { type: AppNotificationType.Success, messageKey, payload };
}
