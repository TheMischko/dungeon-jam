import { AppNotification } from '@shared/models/notification.model';

export type NotificationApiWindow = Window &
  typeof globalThis & {
    NOTIFICATION_API: {
      onNotification: (callback: (notification: AppNotification) => void) => void;
    };
  };
