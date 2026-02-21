import { ipcMain } from 'electron';
import { DiscordTokenData } from '@shared/models/discord.model';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';

export class DiscordTokenManager {
  private static instance: DiscordTokenManager;
  private constructor(private db: DatabaseProvider<DiscordTokenData>) {}

  public static async getInstance(): Promise<DiscordTokenManager> {
    if (!DiscordTokenManager.instance) {
      const db = await DiscordTokenManager.prepareDatabase();
      DiscordTokenManager.instance = new DiscordTokenManager(db);
      DiscordTokenManager.instance.registerIpcHandlers();
    }
    return DiscordTokenManager.instance;
  }

  public async saveToken(data: DiscordTokenData): Promise<DiscordTokenData> {
    try {
      return await this.db.update('apiKey', data.apiKey, data);
    } catch (error) {
      console.error('[DiscordTokenManager] Failed to save token', error);
      throw error;
    }
  }

  public async getTokens(): Promise<DiscordTokenData[]> {
    try {
      return await this.db.getAll();
    } catch (error) {
      console.error('[DiscordTokenManager] Failed to load tokens', error);
      throw error;
    }
  }

  public async deleteToken(apiKey: string): Promise<boolean> {
    try {
      return await this.db.deleteOne('apiKey', apiKey);
    } catch (error) {
      console.error('[DiscordTokenManager] Failed to delete token', error);
      throw error;
    }
  }

  private registerIpcHandlers(): void {
    ipcMain.handle(DiscordTokenChannel.CREATE, async (_, data: DiscordTokenData) => {
      return await this.saveToken(data);
    });

    ipcMain.handle(DiscordTokenChannel.UPDATE, async (_, data: DiscordTokenData) => {
      return await this.saveToken(data);
    });

    ipcMain.handle(DiscordTokenChannel.GET_ALL, async () => {
      return await this.getTokens();
    });

    ipcMain.handle(DiscordTokenChannel.DELETE, async (_, apiKey: string) => {
      return await this.deleteToken(apiKey);
    });
  }

  private static async prepareDatabase(): Promise<DatabaseProvider<DiscordTokenData>> {
    return await DatabaseProviderCreator.create<DiscordTokenData>()
      .setTable('discordTokens')
      .setIdColumn('apiKey')
      .complete();
  }

  /**
   * Test helper to reset singleton between specs.
   */
  public static __resetForTests(): void {
    // @ts-ignore allow test hook
    DiscordTokenManager.instance = undefined;
  }
}
