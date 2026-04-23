import { app } from 'electron';
import { configDotenv } from 'dotenv';
import { StartupManager } from './main/managers/startup.manager';
import { ViewManager } from './main/managers/view.manager';
import { GeneralChannels } from '@shared/models/channels.model';
import { Logger } from './main/utils/logger';

configDotenv();
const ENV = process.env.ENV || 'production';
const appLogger = new Logger('APP', 'cyanBright');

app.on('ready', async () => {
  const startup = StartupManager.getInstance(__dirname);
  const managersInitSuccess = await startup.initializeAllManagers();
  const resourcesInitSuccess = await startup.initializeResources();
  const initSuccess = managersInitSuccess && resourcesInitSuccess;
  if (!initSuccess) {
    appLogger.logErrorMessage('Failed to initialize all managers. Exiting.');
    app.quit();
    return;
  } else {
    await sendAppReadySignal();
  }
  await startup.afterAllInitialized();
});

async function sendAppReadySignal() {
  const viewManager = await ViewManager.getInstance();
  viewManager.broadcast(GeneralChannels.APP_READY);
  setInterval(() => {
    viewManager.broadcast(GeneralChannels.APP_READY);
  }, 500);
}
