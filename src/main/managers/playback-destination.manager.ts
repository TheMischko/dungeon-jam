import { ViewManager } from './view.manager';
import { ipcMain } from 'electron';
import { CaptureChannel } from '@shared/models/channels.model';
import { PlaybackChannel } from '@shared/models/channels.model';
import { CaptureSettings } from '@shared/models/capture.model';
import { DiscordManager } from './discord.manager';

export class PlaybackDestinationManager {
  private static instance: PlaybackDestinationManager;

  private constructor(
    private viewManager: ViewManager,
    private discordManager: DiscordManager,
  ) {}

  public static async getInstance(): Promise<PlaybackDestinationManager> {
    if (!PlaybackDestinationManager.instance) {
      const viewManager = await ViewManager.getInstance();
      const discordManager = DiscordManager.getInstance();
      PlaybackDestinationManager.instance = new PlaybackDestinationManager(
        viewManager,
        discordManager,
      );
      await PlaybackDestinationManager.instance.registerChannels();
    }
    return PlaybackDestinationManager.instance!;
  }

  private async registerChannels(): Promise<void> {
    ipcMain.on(
      PlaybackChannel.CAPTURE_SETTINGS,
      (_, settings: CaptureSettings) => {
        this.updateCaptureSettings(settings).catch((e) =>
          console.error('[PlaybackDestination] Error handling update:', e),
        );
      },
    );
    console.log('PlaybackDestinationManager listeners are registered.');
  }

  public async updateCaptureSettings(settings: CaptureSettings): Promise<void> {
    try {
      this.viewManager.captureTab.webContents.send(
        CaptureChannel.SETTINGS,
        settings,
      );
      if (settings.isLocalMuted) {
        this.discordManager.resumeStreaming();
      } else {
        this.discordManager.stopStreaming();
      }
      console.log(
        `[PlaybackDestination] Updated: localMuted=${settings.isLocalMuted}`,
      );
    } catch (e) {
      console.error('[PlaybackDestination] Failed to update:', e);
    }
  }
}
