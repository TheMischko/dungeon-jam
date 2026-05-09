import { RedirectRequest } from '@shared/models/redirect.model';
import { OperatingSystem } from '@shared/models/application.model';

export type GeneralApiModel = Window &
  typeof globalThis & {
    GENERAL_API: {
      triggerRedirect: (request: RedirectRequest) => void;
      registerRedirect: (
        callback: (request: RedirectRequest) => void | Promise<void>,
      ) => void;
      onApplicationReady: (callback: () => void | Promise<void>) => void;
      closeApp: () => Promise<void>;
      minimizeApp: () => Promise<void>;
      maximizeApp: () => Promise<void>;
      getOS: () => Promise<OperatingSystem>;
    };
  };


