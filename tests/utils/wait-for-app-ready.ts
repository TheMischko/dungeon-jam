import { Page } from 'playwright';

export const waitForAppReadySignal = (page: Page): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2500);
  });
};
