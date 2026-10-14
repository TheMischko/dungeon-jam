import { Page } from 'playwright';
import {
  AppUpdateInfo,
  UpdatePreferences,
} from '@shared/models/application.model';

export async function getUpdateInfo(page: Page): Promise<AppUpdateInfo[]> {
  return await page.evaluate(async () => {
    return await (window as any).UPDATE_API.getUpdateInfo();
  });
}

export async function getUpdatePreferences(
  page: Page
): Promise<UpdatePreferences> {
  return await page.evaluate(async () => {
    return await (window as any).UPDATE_API.getPreferences();
  });
}

export async function skipVersion(page: Page): Promise<void> {
  await page.evaluate(async () => {
    return await (window as any).UPDATE_API.skipVersion();
  });
}

export async function updateApp(page: Page): Promise<void> {
  await page.evaluate(async () => {
    return await (window as any).UPDATE_API.updateApp();
  });
}
