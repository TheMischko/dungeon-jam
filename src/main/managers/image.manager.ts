import { app, dialog, ipcMain, OpenDialogOptions } from 'electron';
import path from 'path';
import * as fs from 'node:fs';
import { Logger } from '../utils/logger';
import { ImageChannel } from '@shared/models/channels.model';

export class ImageManager {
  private static instance: ImageManager;
  private logger: Logger = new Logger('ImageManager', 'blue');

  public static async getInstance() {
    if (!ImageManager.instance) {
      await this.prepareImageStorageFolder();
      this.instance = new ImageManager();
      this.instance.registerChannels();
    }
    return this.instance;
  }

  protected registerChannels(): void {
    ipcMain.handle(ImageChannel.OPEN_PICKER, async () => {
      return await this.openImagePicker();
    });
    ipcMain.handle(ImageChannel.DELETE, async (_, imagePath) => {
      return await this.deleteImage(imagePath);
    });
    ipcMain.handle(ImageChannel.PROCESS_AND_SAVE, async (_, imagePath) => {
      return await this.processAndSaveImage(imagePath);
    });
  }

  public async openImagePicker(): Promise<string | null> {
    const dialogResult = await dialog.showOpenDialog(this.imageDialogOptions);
    if (!dialogResult || dialogResult.canceled) {
      return null;
    }
    const path = dialogResult.filePaths[0];
    if (!path) {
      return null;
    }
    return path;
  }

  public async deleteImage(imagePath: string): Promise<void> {
    const normalizedPath = path.normalize(imagePath);
    if (!ImageManager.imageStorageFolder.includes(normalizedPath)) {
      this.logger.logWarning(
        'Image is not part of image storage folder, skipping deletion: ' +
          normalizedPath
      );
      return;
    }
    return new Promise<void>((resolve, reject) => {
      fs.rm(normalizedPath, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  public async processAndSaveImage(originalPath: string): Promise<string> {
    return originalPath;
  }

  private get imageDialogOptions(): OpenDialogOptions {
    return {
      properties: ['openFile'],
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg'],
        },
      ],
    };
  }

  private static get imageStorageFolder(): string {
    return path.normalize(path.join(app.getPath('appData'), 'Images'));
  }

  private static async prepareImageStorageFolder(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.access(this.imageStorageFolder, undefined, (err) => {
        if (err) {
          fs.mkdir(this.imageStorageFolder, (err) => {
            if (err) reject(err);
            resolve();
          });
        }
        resolve();
      });
    });
  }
}
