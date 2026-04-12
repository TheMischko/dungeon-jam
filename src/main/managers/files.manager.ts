import { ipcMain } from 'electron';
import { AudioFileChannel } from '@shared/models/channels.model';
import * as fs from 'node:fs';
import { IAudioMetadata, parseFile } from 'music-metadata';
import { AudioTrack, FileBase64, Track } from '@shared/models/track.model';
import { lookup } from 'mime-types';
import { TrackMetaData } from '../utils/track-meta-data';
import { TagsManager } from './tags.manager';
import { Logger } from '../utils/logger';

export class FilesManager {
  private static _instance: FilesManager;
  private logger = new Logger('FilesManager', 'magenta');

  constructor(private tagsManager: TagsManager) {}

  public static async getInstance() {
    if (!FilesManager._instance) {
      const tagsManager = await TagsManager.getInstance();
      FilesManager._instance = new FilesManager(tagsManager);
      FilesManager._instance.registerChannels();
    }
    return FilesManager._instance;
  }

  async updateTrackFile(track: Track): Promise<void> {
    const fileExists = await this.trackFileExists(track.url);
    if (!fileExists) {
      return Promise.reject(new Error('File does not exist'));
    }
    const tags = await this.tagsManager.getSubset('id', track.tags || []);
    await TrackMetaData.write(track.url, {
      title: track.name,
      author: track.author,
      tags: tags?.map((t) => t.title) || [],
    });
  }

  private registerChannels(): void {
    ipcMain.handle(AudioFileChannel.FETCH_DATA, async (_, paths: string[]) => {
      const data = paths
        .filter((path) => fs.existsSync(path))
        .map(async (path) => await this.readMetadata(path));
      return await Promise.all(data);
    });

    ipcMain.handle(AudioFileChannel.LOAD_FILE, async (_, filePath: string) => {
      return await this.loadFileBase64(filePath);
    });
  }

  private async readMetadata(path: string): Promise<AudioTrack> {
    return new Promise((resolve) => {
      parseFile(path)
        .then((metadata) => {
          const metaData = { ...metadata };
          const genre = metaData.common.genre ?? []
          const tags = genre?.length === 1 ? genre[0].split(',') : metaData.common.genre;
          resolve({
            title: this.getTrackTitle(path, metaData),
            fullPath: path,
            author: metaData.common.artist,
            length: metaData.format.duration || 0,
            tags: tags
          });
        })
        .catch((e: Error) => {
          this.logger.logErrorMessage('Failed to read metadata', {
            filePath: path,
            error: e,
          });
          resolve({
            fullPath: path,
            title: '',
            author: '',
            length: 0,
          });
        });
    });
  }

  private getTrackTitle(_: string, metadata: IAudioMetadata): string {
    if (metadata.common.title) {
      return metadata.common.title;
    }
    return '';
  }

  private async loadFileBase64(filePath: string): Promise<FileBase64> {
    const buffer = await fs.promises.readFile(filePath);
    const mimeType = lookup(filePath) || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    return { base64, mimeType };
  }

  private trackFileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err);
      });
    });
  }
}
