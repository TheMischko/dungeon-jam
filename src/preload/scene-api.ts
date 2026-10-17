import { QueryOptions } from '@shared/models/request.model';
import {
  Scene,
  SceneInsertQuery,
  ScenesRelativeDisplayOrderQuery,
  SceneUpdateQuery,
} from '@shared/models/scene.model';
import { ipcRenderer } from 'electron';
import { SceneChannel } from '@shared/models/channels.model';
import { DisplayOrder } from '@shared/models/display-order.model';

const getAllScenes = async (query: QueryOptions): Promise<Scene[]> => {
  return await ipcRenderer.invoke(SceneChannel.GET_ALL, query);
};

const getSceneById = async (id: string): Promise<Scene | undefined> => {
  return await ipcRenderer.invoke(SceneChannel.GET_BY_ID, id);
};

const insertScene = async (data: SceneInsertQuery): Promise<Scene> => {
  return await ipcRenderer.invoke(SceneChannel.INSERT, data);
};

const updateScene = async (data: SceneUpdateQuery): Promise<Scene> => {
  return await ipcRenderer.invoke(SceneChannel.UPDATE, data);
};

const deleteScene = async (id: string): Promise<void> => {
  return await ipcRenderer.invoke(SceneChannel.DELETE, id);
};

const changeScenesOrder = async (
  query: ScenesRelativeDisplayOrderQuery
): Promise<Map<string, DisplayOrder>> => {
  return await ipcRenderer.invoke(SceneChannel.CHANGE_ORDER, query);
};

export default {
  getAllScenes,
  getSceneById,
  insertScene,
  updateScene,
  deleteScene,
  changeScenesOrder,
};
