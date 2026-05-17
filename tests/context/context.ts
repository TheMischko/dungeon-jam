import { Page } from 'playwright';

export class TestContext {
  public windows!: AppWindows;
}

export type AppWindows = {
  mainWindow: Page;
  sidebarWindow: Page;
  topbarWindow: Page;
};
