import { _electron as electron, ElectronApplication } from 'playwright';
import path from 'node:path';
import { findViewByUrl } from '../utils/find-view-by-url';
import { waitForAppReadySignal } from '../utils/wait-for-app-ready';
import { after, before, binding } from 'cucumber-tsflow';
import { TestContext } from '../context/context';

const appPath = path.join(__dirname, '../../build/src/index.js');

@binding([TestContext])
export class BaseSteps {
  protected electronApp!: ElectronApplication;

  constructor(protected context: TestContext) {}

  @before({ timeout: 10000 })
  async setupTestEnvironment(): Promise<void> {
    this.electronApp = await electron.launch({
      args: [appPath, '--remote-debugging-port=9222'],
      env: { ...process.env, NODE_ENV: 'test', ENV: 'test' },
    });

    const electronProcess = this.electronApp.process();
    electronProcess.stdout?.on('data', (data) => {
      console.log(data.toString().trim());
    });
    electronProcess.stderr?.on('error', (data) => {
      console.error(data.toString().trim());
    });

    const window = await this.electronApp.firstWindow();
    await waitForAppReadySignal(window);

    const mainWindow = findViewByUrl(this.electronApp, '/main');
    const sideWindow = findViewByUrl(this.electronApp, '/sidebar');
    const topWindow = findViewByUrl(this.electronApp, '/topbar');

    this.context.windows = {
      mainWindow,
      sidebarWindow: sideWindow,
      topbarWindow: topWindow,
    };
  }

  @after()
  async cleanupEnvironment(): Promise<void> {
    await this.electronApp.close();
  }
}
