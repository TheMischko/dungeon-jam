import { ipcMain } from 'electron';
import {
  DiscordTokenData,
  DiscordTokenUpdateData,
} from '@shared/models/discord.model';
import { DiscordTokenChannel } from '@shared/models/channels.model';
import { DatabaseProvider } from '../database/database-provider';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { Logger } from '../utils/logger';
import { DiscordManager } from './discord.manager';
import { withAppError } from '../utils/ipc-handler';
import { createAppError } from '../utils/create-app-error';
import { ErrorCode } from '@shared/models/error.model';

export class DiscordTokenManager {
  private static instance: DiscordTokenManager;
  private logger = new Logger('DiscordTokenManager', 'yellow');
  private constructor(private db: DatabaseProvider<DiscordTokenData>) {}

  public static async getInstance(): Promise<DiscordTokenManager> {
    if (!DiscordTokenManager.instance) {
      const db = await DiscordTokenManager.prepareDatabase();
      DiscordTokenManager.instance = new DiscordTokenManager(db);
      DiscordTokenManager.instance.registerIpcHandlers();
    }
    return DiscordTokenManager.instance;
  }

  public async saveToken(
    data: DiscordTokenUpdateData,
    id?: string
  ): Promise<DiscordTokenData> {
    const tokenData = this.updateDates(data);
    this.logger.log(`Saving token with id ${id} and data:`, tokenData);
    try {
      const oldToken = id ? await this.db.getBy('id', id) : null;
      this.logger.log('Existing token found:', oldToken!);
      if (oldToken) {
        return await this.db.replaceRecord({
          ...oldToken,
          ...tokenData,
        });
      }
      this.logger.log('No existing token found, creating new one', data);
      return await this.db.create(tokenData, id);
    } catch (error) {
      throw createAppError(ErrorCode.DatabaseUpdateFailed, 'Failed to save token.');
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

  public async deleteToken(id: string): Promise<boolean> {
    try {
      return await this.db.deleteOne('id', id);
    } catch (error) {
      throw createAppError(ErrorCode.DatabaseDeleteFailed, 'Failed to delete token.');
    }
  }

  public async getTokenById(id: string): Promise<DiscordTokenData | null> {
    try {
      return await this.db.getBy('id', id);
    } catch (error) {
      console.error(
        `[DiscordTokenManager] Failed to get token by id ${id}`,
        error
      );
      throw error;
    }
  }

  public async connectActiveTokens(): Promise<void> {
    const tokens = await this.getTokens();
    const discordService = await DiscordManager.getInstance();
    for (const token of tokens) {
      this.logger.log(`Connecting with loaded active token ${token.id}...`);
      await discordService.connectNewToken(token.id);
    }
  }

  private registerIpcHandlers(): void {
    ipcMain.handle(
      DiscordTokenChannel.CREATE,
      withAppError(async (_, data: DiscordTokenUpdateData) => {
        return await this.saveToken(data);
      })
    );

    ipcMain.handle(
      DiscordTokenChannel.UPDATE,
      withAppError(async (_, payload: { id: string; newData: DiscordTokenUpdateData }) => {
        const result = await this.saveToken(payload.newData, payload.id);
        this.logger.log(`Token updated. Result:`, result);
        return result;
      })
    );

    ipcMain.handle(DiscordTokenChannel.GET_ALL, withAppError(async () => {
      const resp = await this.getTokens();
      this.logger.log(`Request for tokens resulted in ${resp.length} records`);
      return resp;
    }));

    ipcMain.handle(DiscordTokenChannel.DELETE, withAppError(async (_, id: string) => {
      return await this.deleteToken(id);
    }));
  }

  private static async prepareDatabase(): Promise<
    DatabaseProvider<DiscordTokenData>
  > {
    return await DatabaseProviderCreator.create<DiscordTokenData>()
      .setTable('discordTokens')
      .setIdColumn('id')
      .complete();
  }

  /**
   * Test helper to reset singleton between specs.
   */
  public static __resetForTests(): void {
    // @ts-ignore allow test hook
    DiscordTokenManager.instance = undefined;
  }

  private updateDates(
    token: DiscordTokenUpdateData
  ): DiscordTokenUpdateDataInternal {
    const now = new Date();
    return {
      ...token,
      updatedAt: now,
      lastUsedAt: now,
    };
  }
}

type DiscordTokenUpdateDataInternal = DiscordTokenUpdateData & {
  updatedAt: Date;
  lastUsedAt: Date;
};
