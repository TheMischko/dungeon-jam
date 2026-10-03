import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'node:path';
import { findViewByUrl } from '../utils/find-view-by-url';
import { waitForAppReadySignal } from '../utils/wait-for-app-ready';
import { after, before, binding } from 'cucumber-tsflow';
import { TestContext } from '../context/context';
import * as fs from 'node:fs';
import { MockUpdateServer } from '../utils/mock-update-server';

import { setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(40000);

const appPath = path.join(__dirname, '../../build/src/index.js');
const dbPath = path.join(__dirname, '../../build/src/db_test.json');

@binding([TestContext])
export class BaseSteps {
  protected electronApp!: ElectronApplication;

  constructor(protected context: TestContext) {}

  @before({ timeout: 25000 })
  async setupTestEnvironment(): Promise<void> {
    const mockServer = MockUpdateServer.getInstance();
    const serverUrl = await mockServer.start();
    process.env.TEST_UPDATE_SERVER_URL = serverUrl;

    this.electronApp = await electron.launch({
      args: [appPath, '--remote-debugging-port=9222'],
      env: { ...process.env, NODE_ENV: 'test', ENV: 'test' },
    });
    this.context.electronApp = this.electronApp;

    const window = await this.electronApp.firstWindow();
    await waitForAppReadySignal(window);

    const mainWindow = await findViewByUrl(this.electronApp, '/main');
    const sideWindow = await findViewByUrl(this.electronApp, '/sidebar');
    const topWindow = await findViewByUrl(this.electronApp, '/topbar');

    this.context.windows = {
      mainWindow,
      sidebarWindow: sideWindow,
      topbarWindow: topWindow,
    };
  }

  async reloadMainWindow(): Promise<void> {
    await this.context.windows.mainWindow.reload();
    await waitForAppReadySignal(this.context.windows.mainWindow);
  }

  async restartApplication(
    envOverrides: Record<string, string> = {}
  ): Promise<void> {
    if (this.context?.electronApp) {
      try {
        await this.context.electronApp.close();
      } catch {}
    } else if (this.electronApp) {
      try {
        await this.electronApp.close();
      } catch {}
    }

    const env = {
      ...process.env,
      NODE_ENV: 'test',
      ENV: 'test',
      ...envOverrides,
    };

    const args = [appPath, '--remote-debugging-port=9222'];
    if (envOverrides.TEST_APP_VERSION) {
      args.push(`--app-version=${envOverrides.TEST_APP_VERSION}`);
    }

    this.electronApp = await electron.launch({
      args,
      env,
    });
    this.context.electronApp = this.electronApp;

    const window = await this.electronApp.firstWindow();
    await waitForAppReadySignal(window);

    const mainWindow = await findViewByUrl(this.electronApp, '/main');
    const sideWindow = await findViewByUrl(this.electronApp, '/sidebar');
    const topWindow = await findViewByUrl(this.electronApp, '/topbar');

    this.context.windows = {
      mainWindow,
      sidebarWindow: sideWindow,
      topbarWindow: topWindow,
    };
  }

  @after()
  async cleanupEnvironment(): Promise<void> {
    delete process.env.TEST_APP_VERSION;
    if (this.context?.electronApp) {
      try {
        await this.context.electronApp.close();
      } catch {}
    } else if (this.electronApp) {
      try {
        await this.electronApp.close();
      } catch {}
    }

    // Cleanup DB
    if (fs.existsSync(dbPath)) await fs.promises.rm(dbPath);

    MockUpdateServer.getInstance().setAvailableRelease(null);
    MockUpdateServer.getInstance().resetRequestsCount();
  }
}
