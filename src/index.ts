import { app } from 'electron';
import { configDotenv } from 'dotenv';
import { StartupManager } from './main/managers/startup.manager';
import { ViewManager } from './main/managers/view.manager';
import { GeneralChannels } from '@shared/models/channels.model';
import { Logger } from './main/utils/logger';
import path from 'path';

configDotenv();
const ENV = process.env.ENV || 'production';
const appLogger = new Logger('APP', 'cyanBright');
let startupManager: StartupManager;

app.name = 'dungeon-jam';

if (!app.isPackaged) {
  const appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, app.name));
}

app.on('ready', async () => {
  try {
    startupManager = StartupManager.getInstance(__dirname, ENV);
    const managersInitSuccess = await startupManager.initializeAllManagers();
    const resourcesInitSuccess = await startupManager.initializeResources();
    const initSuccess = managersInitSuccess && resourcesInitSuccess;
    if (!initSuccess) {
      appLogger.logErrorMessage('Failed to initialize all managers. Exiting.');
      app.quit();
      return;
    } else {
      await sendAppReadySignal();
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

const sendAppReadySignal = async () => {
  const viewManager = await ViewManager.getInstance();
  viewManager.broadcast(GeneralChannels.APP_READY);
  setInterval(() => {
    viewManager.broadcast(GeneralChannels.APP_READY);
  }, 500);
};
