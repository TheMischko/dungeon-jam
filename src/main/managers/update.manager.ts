import { autoUpdater } from 'electron-updater';
import { Logger } from '../utils/logger';

export class UpdateManager {
  private static instance: UpdateManager;
  private logger = new Logger('UpdateManager', 'magenta');

  private constructor() {
    this.setupAutoUpdater();
  }

  public static async getInstance(): Promise<UpdateManager> {
    if (!this.instance) {
      this.instance = new UpdateManager();
    }
    return this.instance;
  }

  private setupAutoUpdater(): void {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      this.logger.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.logger.log(`Update available: ${info.version}`);
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
