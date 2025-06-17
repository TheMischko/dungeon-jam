import {ipcMain} from "electron";
import {AudioFileChannel} from "@shared/models/channels.model";
import * as fs from "node:fs";
import {IAudioMetadata, parseFile} from "music-metadata";
import path from "node:path";
import {AudioTrack} from "@shared/models/track.model";

export class FilesManager{
  private static _instance: FilesManager;

  public static async getInstance() {
    if(!FilesManager._instance){
      FilesManager._instance = new FilesManager();
      FilesManager._instance.registerChannels();
    }
    return FilesManager._instance;
  }

  private registerChannels(): void{
    ipcMain.handle(AudioFileChannel.FETCH_DATA, async (_, paths: string[]) => {
      const data = paths
        .filter((path) => fs.existsSync(path))
        .map(async (path) => await this.readMetadata(path))
      return await Promise.all(data)
    })
  }

  private async readMetadata(path: string): Promise<AudioTrack> {
    return new Promise((resolve) => {
      parseFile(path).then(metadata => {
        const metaData = {...metadata};
        resolve({
          title: this.getTrackTitle(path, metaData),
          fullPath: path,
          author: metaData.common.artist,
          length: metaData.format.duration || 0
        });
      }).catch((e: Error) => {
        console.error(e);
        resolve({
          fullPath: path,
          title: '',
          author: '',
          length: 0
        })
      })

    })

  }

  private getTrackTitle(filePath: string, metadata: IAudioMetadata): string{
    if (metadata.common.title){
      return metadata.common.title
    }
    return path.basename(filePath, path.extname(filePath));
  }
}