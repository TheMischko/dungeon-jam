import { app, dialog, ipcMain, OpenDialogOptions } from 'electron';
import path from 'path';
import * as fs from 'node:fs';
import { Logger } from '../utils/logger';
import { ImageChannel } from '@shared/models/channels.model';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { LRUCache } from '../../../frontend/projects/general/src/lib/utils/lru-cache';

export class ImageManager {
  private static instance: ImageManager;
  private logger: Logger = new Logger('ImageManager', 'blue');
  private cache = new LRUCache<string, Buffer>(60);

  public static async getInstance() {
    if (!ImageManager.instance) {
      await this.prepareImageStorageFolder();
      this.instance = new ImageManager();
      this.instance.registerChannels();
    }
    return this.instance;
  }

  protected registerChannels(): void {
    ipcMain.handle(ImageChannel.FETCH_IMAGE, async (_, imagePath: string) => {
      return await this.fetchImage(imagePath);
    });
    ipcMain.handle(ImageChannel.OPEN_PICKER, async () => {
      return await this.openImagePicker();
    });
    ipcMain.handle(ImageChannel.DELETE, async (_, imagePath: string) => {
      return await this.deleteImage(imagePath);
    });
    ipcMain.handle(
      ImageChannel.PROCESS_AND_SAVE,
      async (_, imagePath: string, entityType: string) => {
        return await this.processAndSaveImage(imagePath, entityType);
      }
    );
  }

  public async fetchImage(imagePath: string): Promise<string | null> {
    if (!imagePath.includes(ImageManager.imageStorageFolder)) {
      return null;
    }
    try {
      const cached = this.cache.get(imagePath);
      if (cached) {
        return this.bufferToBase64Source(cached);
      }
      const buffer = await sharp(imagePath).toBuffer();
      this.cache.put(imagePath, buffer);
      return this.bufferToBase64Source(buffer);
    } catch (e) {
      this.logger.logErrorMessage('Cannot load image ' + imagePath, e as Error);
      return null;
    }
  }

  private bufferToBase64Source(buffer: Buffer): string {
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
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

  public async processAndSaveImage(
    originalPath: string,
    entityType: string
  ): Promise<string> {
    const fileName = uuid() + '.jpg';
    const filePath = path.join(
      ImageManager.imageStorageFolder,
      entityType,
      fileName
    );
    try {
      await sharp(originalPath)
        .resize({
          width: 600,
          withoutEnlargement: true,
        })
        .jpeg({
          mozjpeg: true,
          quality: 80,
        })
        .toFile(filePath);
      return filePath;
    } catch (e) {
      this.logger.logErrorMessage(
        'Cannot process and save image ' + originalPath,
        e as Error
      );
      throw e;
    }
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
