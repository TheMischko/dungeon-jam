import { ViewManager } from './view.manager';
import { ipcMain } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import { RedirectRequest } from '@shared/models/redirect.model';

export class RedirectManager {
  private static instance: RedirectManager;

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
      console.log(
        `[REDIRECT]: ${request.path}${
          request?.params
            ? `?${new URLSearchParams(request.params).toString()}`
            : ''
        }`,
      );
      viewManager.broadcast(GeneralChannels.REDIRECT, null, request);
    });
    console.log('RedirectManager listeners are registered.');
  }
}
