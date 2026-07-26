import { AppError } from './error.model';

export enum AppNotificationType {
  Error = 'error',
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
}

export const NotificationMessageKey = {
  DiscordTokenConnected: 'NOTIFICATIONS.DISCORD.TOKEN_CONNECTED',
  DiscordChannelJoined: 'NOTIFICATIONS.DISCORD.CHANNEL_JOINED',
} as const;

export type NotificationMessageKeyType =
  (typeof NotificationMessageKey)[keyof typeof NotificationMessageKey];

export type AppNotification =
  | { type: AppNotificationType.Error; error: AppError }
  | {
      type:
        | AppNotificationType.Success
        | AppNotificationType.Info
        | AppNotificationType.Warning;
      messageKey: NotificationMessageKeyType;
      titleKey?: string;
      payload?: unknown;
    };
