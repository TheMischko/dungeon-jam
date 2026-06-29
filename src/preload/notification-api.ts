import { ipcRenderer } from 'electron';
import { NotificationChannel } from '@shared/models/channels.model';
import { AppNotification } from '@shared/models/notification.model';

const onNotification = (
  callback: (notification: AppNotification) => void
): void => {
  ipcRenderer.on(NotificationChannel.PUSH, (_, notification: AppNotification) => {
    callback(notification);
  });
};

export default { onNotification };
