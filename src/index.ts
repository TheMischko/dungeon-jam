import { app } from 'electron';
import { configDotenv } from 'dotenv';
import { StartupManager } from './main/managers/startup.manager';

configDotenv();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'ERROR';
const ENV = process.env.ENV || 'production';
console.log('DISCORD_TOKEN', DISCORD_TOKEN);

app.on('ready', async () => {
  const startup = StartupManager.getInstance(__dirname, DISCORD_TOKEN);
  const managersInitSuccess = await startup.initializeAllManagers();
  const resourcesInitSuccess = await startup.initializeResources();
  const initSuccess = managersInitSuccess && resourcesInitSuccess;
  if (!initSuccess) {
    console.error('[App] Failed to initialize all managers. Exiting.');
    app.quit();
    return;
  }
});
