import { app, powerSaveBlocker } from 'electron';
import { StartupManager } from './main/managers/startup.manager';
import { Logger } from './main/utils/logger';
import os from 'node:os';
import path from 'path';
import { AppInfoManager } from './main/managers/app-info.manager';
import pkg from '../package.json';

import { DatabaseWrapper } from './main/database/database';

const ENV = process.env.ENV || process.env.DEFAULT_ENV || 'production';
const appLogger = new Logger('APP', 'cyanBright');
let startupManager: StartupManager;
let powerSaveBlockerId: number | null = null;

// Prevent Chromium from throttling renderers and timers when window is minimized or hidden on Windows
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

const versionArg = process.argv.find((arg) => arg.startsWith('--app-version='));
const appVersion = versionArg
  ? versionArg.split('=')[1]
  : process.env.TEST_APP_VERSION || pkg.version;
app.name = pkg.name;
// @ts-ignore
app.version = appVersion;
app.getVersion = () => appVersion;

if (!app.isPackaged) {
  const appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, app.name));
}

Logger.initGlobalErrorHandlers();
Logger.cleanOldLogs(20);

app.on('ready', async () => {
  try {
    try {
      os.setPriority(os.constants.priority.PRIORITY_ABOVE_NORMAL);
    } catch (e) {
      appLogger.logWarning('Could not set process priority', {
        error: String(e),
      });
    }

    // Prevent app suspension and aggressive power throttling on Windows
    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');

    appLogger.log(`Starting DungeonJam v${app.getVersion()}`, {
      env: ENV,
    });
    startupManager = StartupManager.getInstance(__dirname, ENV);
    const managersInitSuccess = await startupManager.initializeAllManagers();
    const resourcesInitSuccess = await startupManager.initializeResources();
    const initSuccess = managersInitSuccess && resourcesInitSuccess;
    if (!initSuccess) {
      appLogger.logErrorMessage('Failed to initialize all managers. Exiting.');
      app.quit();
      return;
    } else {
      const appInfoManager = await AppInfoManager.getInstance();
      appInfoManager.sendAppReadySignal();
    }
    await startupManager.afterAllInitialized();
  } catch (e) {
    appLogger.logErrorMessage('Fatal error during startup', {
      error: String(e),
    });
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', async () => {
  if (
    powerSaveBlockerId !== null &&
    powerSaveBlocker.isStarted(powerSaveBlockerId)
  ) {
    powerSaveBlocker.stop(powerSaveBlockerId);
  }
  DatabaseWrapper.cleanupTempDb();
  await startupManager.onAppEnd();
});
