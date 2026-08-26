import { autoUpdater, UpdateInfo } from 'electron-updater';
import { Logger } from '../utils/logger';
import { ipcMain } from 'electron';
import { UpdateChannel } from '@shared/models/channels.model';
import { withAppError } from '../utils/ipc-handler';
import { AppUpdateInfo } from '@shared/models/application.model';

export class UpdateManager {
  private static instance: UpdateManager;
  private logger = new Logger('UpdateManager', 'magenta');
  private updateInfo: UpdateInfo | undefined;

  private constructor() {
    this.setupAutoUpdater();
  }

  public static async getInstance(): Promise<UpdateManager> {
    if (!this.instance) {
      this.instance = new UpdateManager();
      this.instance.registerHandlers();
    }
    return this.instance;
  }

  private registerHandlers(): void {
    ipcMain.handle(UpdateChannel.GET_UPDATE_INFO, async () => {
      await autoUpdater.checkForUpdates();
      return this.getUpdateData();
    });
    ipcMain.handle(
      UpdateChannel.UPDATE_APP,
      withAppError(async () => {
        autoUpdater.autoRunAppAfterInstall = true;
        await autoUpdater.downloadUpdate();
        autoUpdater.quitAndInstall();
      })
    );
  }

  getUpdateData(): AppUpdateInfo[] {
    if (!this.updateInfo) {
      return [];
    }
    if (typeof this.updateInfo.releaseNotes === 'string') {
      return [
        {
          version: this.updateInfo.version,
          note: this.updateInfo.releaseNotes,
        },
      ];
    }
    return this.updateInfo.releaseNotes ?? [];
  }

  private setupAutoUpdater(): void {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.fullChangelog = true;
    autoUpdater.forceDevUpdateConfig = true;

    autoUpdater.on('checking-for-update', () => {
      this.logger.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.logger.log(`Update available: ${info.version}`);
      this.updateInfo = info;
    });

    autoUpdater.on('update-not-available', () => {
      this.logger.log('Application is up to date.');
    });

    autoUpdater.on('error', (err) => {
      this.logger.logWarning(
        'Auto-updater encountered an error (expected if no releases published on GitHub yet):',
        { error: String(err) }
      );
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.logger.log(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`
      );
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.logger.log(
        `Update downloaded: ${info.version}. Will install on app quit.`
      );
    });
  }

  public checkForUpdates(): void {
    try {
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        this.logger.logWarning('Failed to check for updates', {
          error: String(err),
        });
      });
    } catch (err) {
      this.logger.logWarning('Failed to check for updates', {
        error: String(err),
      });
    }
  }
}
