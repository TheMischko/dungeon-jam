import {DatabaseWrapper} from "../database/database";
import {ipcMain} from "electron";
import {PlaybackChannel} from "@shared/models/channels.model";
import {StoredPlayback} from "@shared/models/track.model";

export class StoredPlaybackManager {
  private static _instance: StoredPlaybackManager;
  private readonly TABLE_NAME = 'playback';

  constructor(private readonly database: DatabaseWrapper) {
  }

  public static async getInstance(): Promise<StoredPlaybackManager>{
    if(!StoredPlaybackManager._instance){
      const database = await DatabaseWrapper.getInstance();
      const manager = new StoredPlaybackManager(database);
      manager.registerChannels();
      StoredPlaybackManager._instance = manager;
    }
    return StoredPlaybackManager._instance!;
  }

  private registerChannels(){
    ipcMain.handle(PlaybackChannel.LOAD, () => {
      return this.load();
    });
    ipcMain.on(PlaybackChannel.UPDATE, async (_, newState: StoredPlayback) => {
      await this.update(newState);
    })
  }

  private load(): StoredPlayback{
    return this.database.readTable<StoredPlayback>(this.TABLE_NAME)!;
  }

  private async update(newState: StoredPlayback): Promise<void>{
    await this.database.updateTable(this.TABLE_NAME, newState);
  }
}