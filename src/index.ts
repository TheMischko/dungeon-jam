import { app } from 'electron';
import { configDotenv } from 'dotenv';
import { StartupManager } from './main/managers/startup.manager';
import { Logger } from './main/utils/logger';
import path from 'path';
import { AppInfoManager } from './main/managers/app-info.manager';
import pkg from '../package.json';

configDotenv();
const ENV = process.env.ENV || 'production';
const appLogger = new Logger('APP', 'cyanBright');
let startupManager: StartupManager;

app.name = pkg.name;
app.version = pkg.version;

if (!app.isPackaged) {
  const appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, app.name));
}

Logger.initGlobalErrorHandlers();
Logger.cleanOldLogs(5);

app.on('ready', async () => {
  try {
    appLogger.log(`Starting DungeonJam v${app.getVersion()}`, { env: ENV });
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
  await startupManager.onAppEnd();
});
