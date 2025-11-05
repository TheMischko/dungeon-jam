import {DatabaseWrapper} from "../database/database";
import {ipcMain} from "electron";
import {TagChannel} from "@shared/models/channels.model";
import {QueryRequest} from "@shared/models/request.model";

export class TagsManager {
  private static _instance: TagsManager;

  private constructor(private database: DatabaseWrapper) {}

  public static async getInstance(): Promise<TagsManager> {
    if(!TagsManager._instance){
      const database = await DatabaseWrapper.getInstance();
      TagsManager._instance = new TagsManager(database);
      TagsManager._instance.registerChannels()
    }
    return TagsManager._instance;
  }

  private registerChannels(): void{
    ipcMain.handle(TagChannel.GET_ALL, (_, query?: QueryRequest) => {
      return this.getAll(query);
    });
  }

  private getAll(query: QueryRequest | undefined) {

  }
}