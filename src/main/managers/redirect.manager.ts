import { ViewManager } from './view.manager';
import { ipcMain } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import { RedirectRequest } from '@shared/models/redirect.model';
import { Logger } from '../utils/logger';

export class RedirectManager {
  private static instance: RedirectManager;
  private logger = new Logger('RedirectManager', 'blueBright');

  public static async getInstance(): Promise<RedirectManager> {
    if (!RedirectManager.instance) {
      RedirectManager.instance = new RedirectManager();
      await RedirectManager.instance.registerChannels();
    }
    return RedirectManager.instance!;
  }

  private async registerChannels(): Promise<void> {
    const viewManager = await ViewManager.getInstance();

    ipcMain.on(GeneralChannels.REDIRECT, (e, request: RedirectRequest) => {
      this.logger.log('Redirect request received', { request });
      viewManager.broadcast(GeneralChannels.REDIRECT, e.processId, request);
    });
    this.logger.log('Listeners registered');
  }
}
