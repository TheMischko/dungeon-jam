import {
  AppUpdateInfo,
  UpdatePreferences,
} from '@shared/models/application.model';

export type UpdateApiWindow = Window &
  typeof globalThis & {
    UPDATE_API: {
      getUpdateInfo: () => Promise<AppUpdateInfo[]>;
      updateApp: () => Promise<void>;
      skipVersion: () => Promise<void>;
      getPreferences: () => Promise<UpdatePreferences>;
    };
  };

