import { QueryOptions } from '@shared/models/request.model';
import {
  SessionData,
  SessionInsertQuery,
  SessionScenesQuery,
  SessionUpdateQuery,
} from '@shared/models/session.model';
import { ipcRenderer } from 'electron';
import { SessionChannel } from '@shared/models/channels.model';
import { Scene } from '@shared/models/scene.model';

const getAllSessions = async (query: QueryOptions): Promise<SessionData[]> => {
  return await ipcRenderer.invoke(SessionChannel.GET_ALL, query);
};

const getSessionById = async (
  sessionId: string
): Promise<SessionData | null> => {
  return await ipcRenderer.invoke(SessionChannel.GET_BY_ID, sessionId);
};

const insertSession = async (
  insertQuery: SessionInsertQuery
): Promise<SessionData> => {
  return await ipcRenderer.invoke(SessionChannel.INSERT, insertQuery);
};

const updateSession = async (
  updateQuery: SessionUpdateQuery
): Promise<SessionData> => {
  return await ipcRenderer.invoke(SessionChannel.UPDATE, updateQuery);
};

const deleteSession = async (sessionId: string): Promise<void> => {
  return await ipcRenderer.invoke(SessionChannel.DELETE, sessionId);
};

const getSessionScenes = async (
  query: SessionScenesQuery
): Promise<Scene[]> => {
  return await ipcRenderer.invoke(SessionChannel.GET_SESSION_SCENES, query);
};

const getSessionImages = async (
  sessionIds: string[]
): Promise<Record<string, string | null>> => {
  return await ipcRenderer.invoke(SessionChannel.GET_IMAGES, sessionIds);
};

export default {
  getAllSessions,
  getSessionById,
  insertSession,
  updateSession,
  deleteSession,
  getSessionScenes,
  getSessionImages,
};
