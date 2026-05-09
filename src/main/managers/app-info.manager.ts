import { app, ipcMain } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import * as os from 'node:os';
import { OperatingSystem } from '@shared/models/application.model';
import { ViewManager } from './view.manager';
import { Logger } from '../utils/logger';

export class AppInfoManager {
  private static instance: AppInfoManager;

  private logger = new Logger('AppInfoManager', 'blue');

  constructor(private viewManager: ViewManager) {}

  public static async getInstance(): Promise<AppInfoManager> {
    if (!this.instance) {
      const viewManager = await ViewManager.getInstance();
      this.instance = new AppInfoManager(viewManager);
      this.instance.registerChannels();
    }
    return this.instance;
  }

  private registerChannels(): void {
    ipcMain.handle(GeneralChannels.GET_OS, () => {
      const os = this.getOS();
      this.logger.log('Fetching OS info. Result: ' + os);
      return os;
    });
    ipcMain.handle(GeneralChannels.CLOSE_APP, () => {
      this.logger.log('Closing Application via API.');
      return this.closeApp();
    });
    ipcMain.handle(GeneralChannels.MINIMIZE_APP, () => {
      this.logger.log('Minimizing Application via API.');
      return this.minimizeApp();
    });
    ipcMain.handle(GeneralChannels.MAXIMIZE_APP, () => {
      this.logger.log('Maximizing Application via API.');
      return this.maximizeApp();
    });
  }

  public getOS(): OperatingSystem {
    const system = os.type();
    switch (true) {
      case system === 'Windows_NT': {
        return OperatingSystem.Windows;
      }
      case system === 'Darwin': {
        return OperatingSystem.MacOS;
      }
      default: {
        return OperatingSystem.Linux;
      }
    }
  }

  public closeApp() {
    app.quit();
  }

  public minimizeApp() {
    this.viewManager.appWindow.minimize();
  }

  public maximizeApp() {
    this.viewManager.appWindow.maximize();
  }

  public sendAppReadySignal() {
    this.viewManager.broadcast(GeneralChannels.APP_READY);
    setInterval(() => {
      this.viewManager.broadcast(GeneralChannels.APP_READY);
    }, 500);
  }
}
