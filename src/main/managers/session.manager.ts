import { ipcMain } from 'electron';
import { DatabaseProvider } from '../database/database-provider';
import {
  SessionData,
  SessionInsertQuery,
  SessionSceneRef,
  SessionScenesQuery,
  SessionUpdateQuery,
} from '@shared/models/session.model';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { Logger } from '../utils/logger';
import { withAppError } from '../utils/ipc-handler';
import { QueryRequest } from '@shared/models/request.model';
import { SessionChannel } from '@shared/models/channels.model';
import { createAppError } from '../utils/create-app-error';
import { ErrorCode } from '@shared/models/error.model';
import { Scene } from '@shared/models/scene.model';
import { SceneManager } from './scene.manager';
import { SortDirection } from '@shared/models/common.model';

export class SessionManager {
  private static _instance: SessionManager;

  private readonly logger = new Logger('SessionManager', 'greenBright');

  constructor(private readonly database: DatabaseProvider<SessionData>) {}

  public static async getInstance(): Promise<SessionManager> {
    if (!this._instance) {
      const databaseCreator = DatabaseProviderCreator.create<SessionData>();
      const database = await databaseCreator
        .setTable('sessions')
        .setIdColumn('id')
        .complete();
      this._instance = new SessionManager(database);
      this._instance.registerHandlers();
    }
    return this._instance;
  }

  private registerHandlers(): void {
    ipcMain.handle(
      SessionChannel.GET_ALL,
      withAppError(async (_, query: QueryRequest) => {
        this.logger.log('Fetching all sessions.', { query });
        const result = await this.getAll(query);
        this.logger.log(`Found ${result.length} sessions`);
        return result;
      })
    );

    ipcMain.handle(
      SessionChannel.GET_BY_ID,
      withAppError(async (_, sessionId: string) => {
        this.logger.log(`Fetching session with ID.`, { sessionId });
        return await this.getById(sessionId);
      })
    );

    ipcMain.handle(
      SessionChannel.INSERT,
      withAppError(async (_, data: SessionInsertQuery) => {
        this.logger.log('Inserting new session.', { newSessionData: data });
        return await this.insert(data);
      })
    );

    ipcMain.handle(
      SessionChannel.UPDATE,
      withAppError(async (_, data: SessionUpdateQuery) => {
        this.logger.log('Updating session.', { data });
        const result = await this.update(data);
        this.logger.log('Session updated.', { result });
        return result;
      })
    );

    ipcMain.handle(
      SessionChannel.DELETE,
      withAppError(async (_, sessionId: string) => {
        this.logger.log('Deleting session.', { sessionId });
        return await this.delete(sessionId);
      })
    );

    ipcMain.handle(
      SessionChannel.GET_SESSION_SCENES,
      withAppError(async (_, query: SessionScenesQuery) => {
        this.logger.log('Fetching scenes for a session.', { request: query });
        const result = await this.getSessionScenes(query);
        this.logger.log(`Found ${result.length} scenes.`);
        return result;
      })
    );
  }

  public async getAll(query: QueryRequest): Promise<SessionData[]> {
    return await this.database.getAll(query);
  }

  public async getById(sessionId: string): Promise<SessionData | null> {
    return (await this.database.getBy('id', sessionId)) ?? null;
  }

  public async delete(sessionId: string): Promise<void> {
    await this.database.deleteOne('id', sessionId);
  }

  public async insert(sessionData: SessionInsertQuery): Promise<SessionData> {
    if (!sessionData?.name || sessionData.name.length < 2) {
      throw createAppError(
        ErrorCode.SessionIdRequired,
        `Session name is invalid.`
      );
    }
    const totalCount = await this.getTotalCount();
    const currentDate = new Date();
    const data: Omit<SessionData, 'id'> = {
      name: sessionData.name,
      description: sessionData.description,
      dateOfSession: sessionData.dateOfSession,
      scenes: [],
      order: totalCount ?? 0,
      dateCreated: currentDate,
      dateUpdated: currentDate,
    };

    return await this.database.create(data);
  }

  public async update(updateData: SessionUpdateQuery): Promise<SessionData> {
    const current = await this.getById(updateData.id);
    if (!current) {
      throw createAppError(
        ErrorCode.DatabaseNotFound,
        `Session with ID ${updateData.id} not found for update.`
      );
    }

    const updatedData: SessionData = {
      ...current,
      dateUpdated: new Date(),
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && {
        description: updateData?.description ?? undefined,
      }),
      ...(updateData.dateOfSession !== undefined && {
        dateOfSession: updateData?.dateOfSession ?? undefined,
      }),
    };

    if (updateData?.scenesRemoved?.length) {
      updatedData.scenes = updatedData.scenes
        .filter((s) => !updateData.scenesRemoved!.includes(s.sceneId))
        .sort(orderSceneRefFn)
        .map(mapRefIndexToOrder);
      return await this.database.replaceRecord(updatedData);
    }

    if (updateData?.scenesAdded?.length) {
      updateData.scenesAdded.forEach((newRef) => {
        updatedData.scenes.push({
          ...newRef,
          order: newRef.order ?? Number.MAX_SAFE_INTEGER,
        });
      });
      updatedData.scenes = updatedData.scenes
        .sort(orderSceneRefFn)
        .map(mapRefIndexToOrder);
      return await this.database.replaceRecord(updatedData);
    }

    if (
      updateData?.scenesReordered?.length &&
      updateData.scenesReordered.length === current.scenes.length
    ) {
      const idOrderMap = new Map(
        updateData.scenesReordered.map((id, index) => [id, index])
      );
      updatedData.scenes = updatedData.scenes
        .sort((a, b) => {
          const indexA = idOrderMap.get(a.sceneId) ?? Number.MAX_SAFE_INTEGER;
          const indexB = idOrderMap.get(b.sceneId) ?? Number.MAX_SAFE_INTEGER;
          return indexA - indexB;
        })
        .map(mapRefIndexToOrder);
      return await this.database.replaceRecord(updatedData);
    }

    return await this.database.replaceRecord(updatedData);
  }

  public async getTotalCount(): Promise<number> {
    const all = await this.getAll({});
    return all.length;
  }

  public async getSessionScenes(query: SessionScenesQuery): Promise<Scene[]> {
    const session = await this.getById(query.sessionId);
    if (!session) {
      throw createAppError(
        ErrorCode.DatabaseNotFound,
        `Session with ID ${query.sessionId} cannot be found.`
      );
    }

    const sceneManager = await SceneManager.getInstance();
    const scenes = await sceneManager.getAll(query.query);
    const sessionSceneIds = new Set(session.scenes.map((ref) => ref.sceneId));
    const sessionScenes = scenes.filter((s) => sessionSceneIds.has(s.id));
    if (!query.query.sortBy) {
      const direction = query.query?.sortDirection ?? SortDirection.ASC;
      const directionMul = direction === SortDirection.ASC ? 1 : -1;
      const orderMap = new Map(
        session.scenes.map((ref) => [ref.sceneId, ref.order])
      );
      sessionScenes.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return (orderA - orderB) * directionMul;
      });
    }
    return sessionScenes;
  }
}

// Used to order `SessionSceneRef` by their `order` values.
const orderSceneRefFn = (
  refA: SessionSceneRef,
  refB: SessionSceneRef
): number => {
  return refA.order - refB.order;
};

// Sets current index in the list as order value for `SessionSceneRef`.
const mapRefIndexToOrder = (
  ref: SessionSceneRef,
  index: number
): SessionSceneRef => ({
  ...ref,
  order: index,
});
