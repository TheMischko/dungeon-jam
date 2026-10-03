import { autoUpdater, UpdateInfo } from 'electron-updater';
import { Logger } from '../utils/logger';
import { ipcMain } from 'electron';
import { UpdateChannel } from '@shared/models/channels.model';
import { withAppError } from '../utils/ipc-handler';
import {
  AppUpdateInfo,
  UpdatePreferences,
} from '@shared/models/application.model';
import { DatabaseWrapper } from '../database/database';

export class UpdateManager {
  private static instance: UpdateManager;
  private logger = new Logger('UpdateManager', 'magenta');
  private updateInfo: UpdateInfo | undefined;

  private constructor(private database: DatabaseWrapper) {
    this.setupAutoUpdater();
  }

  public static async getInstance(): Promise<UpdateManager> {
    if (!this.instance) {
      const database = await DatabaseWrapper.getInstance();
      this.instance = new UpdateManager(database);
      this.instance.registerHandlers();
    }
    return this.instance;
  }

  private registerHandlers(): void {
    ipcMain.handle(
      UpdateChannel.GET_UPDATE_INFO,
      withAppError(async () => {
        this.logger.log('GET_UPDATE_INFO called');
        try {
          const checkResult = await autoUpdater.checkForUpdates();
          this.logger.log('checkForUpdates result', {
            hasResult: !!checkResult,
            isUpdateAvailable: checkResult?.isUpdateAvailable,
            version: checkResult?.updateInfo?.version,
          });
          if (checkResult?.isUpdateAvailable && checkResult?.updateInfo) {
            this.updateInfo = checkResult.updateInfo;
          } else {
            this.updateInfo = undefined;
          }
        } catch (err) {
          this.logger.logWarning('checkForUpdates failed in handler', {
            error: String(err),
          });
          this.updateInfo = undefined;
          throw err;
        }
        const data = this.getUpdateData();
        this.logger.log('Returning update data', { data });
        return data;
      })
    );
    ipcMain.handle(
      UpdateChannel.UPDATE_APP,
      withAppError(async () => {
        const version = this.updateInfo?.version;
        this.logger.log(`Installing version ${version}.`);
        autoUpdater.autoRunAppAfterInstall = true;
        if (process.env.ENV === 'test') {
          await this.writeUpdatePreferences({});
          return;
        }
        await autoUpdater.downloadUpdate();
        await this.writeUpdatePreferences({});
        autoUpdater.quitAndInstall();
      })
    );
    ipcMain.handle(
      UpdateChannel.SKIP_VERSION,
      withAppError(async () => {
        const version = this.updateInfo?.version;
        this.logger.log(`Skipping version ${version}.`);
        await this.writeUpdatePreferences({
          skippedVersion: version,
          skippedVersionDate: new Date().toISOString(),
        });
      })
    );
    ipcMain.handle(
      UpdateChannel.GET_PREFERENCES,
      withAppError(async () => {
        const preferences = this.readUpdatePreferences();
        this.logger.log(`Fetching update preferences.`, { preferences });
        return preferences;
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

    if (process.env.ENV === 'test' && process.env.TEST_UPDATE_SERVER_URL) {
      this.logger.log(
        `Configuring test update feed: ${process.env.TEST_UPDATE_SERVER_URL}`
      );
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: process.env.TEST_UPDATE_SERVER_URL,
      });
    } else {
      try {
        autoUpdater.setFeedURL({
          provider: 'github',
          owner: 'TheMischko',
          repo: 'dungeon-jam',
        });
      } catch (err) {
        this.logger.logWarning('Could not set default GitHub feed URL:', {
          error: String(err),
        });
      }
    }

    autoUpdater.on('checking-for-update', () => {
      this.logger.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.logger.log(`Update available: ${info.version}`);
      this.updateInfo = info;
    });

    autoUpdater.on('update-not-available', () => {
      this.logger.log('Application is up to date.');
      this.updateInfo = undefined;
    });

    autoUpdater.on('error', (err) => {
      this.logger.logWarning(
        'Auto-updater encountered an error (expected if no releases published on GitHub yet):',
        { error: String(err) }
      );
      this.updateInfo = undefined;
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

  private readUpdatePreferences(): UpdatePreferences {
    return (
      this.database.readTable<UpdatePreferences>('updatePreferences') ?? {}
    );
  }

  private async writeUpdatePreferences(data: UpdatePreferences) {
    await this.database.updateTable('updatePreferences', data);
  }
}
