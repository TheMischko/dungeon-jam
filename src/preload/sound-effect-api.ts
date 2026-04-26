import { QueryRequest } from '@shared/models/request.model';
import { SoundEffect, SoundEffectCreateData, SoundEffectUpdateData } from '@shared/models/sound-effect.model';
import { ipcRenderer } from 'electron';
import { SoundEffectChannel } from '@shared/models/channels.model';

const getAll = async (query: QueryRequest): Promise<SoundEffect[]> => {
  return await ipcRenderer.invoke(SoundEffectChannel.GET_ALL, query);
};

const getById = async (id: string): Promise<SoundEffect | null> => {
  return await ipcRenderer.invoke(SoundEffectChannel.GET_BY_ID, id);
};

const create = async (data: SoundEffectCreateData): Promise<SoundEffect> => {
  return await ipcRenderer.invoke(SoundEffectChannel.CREATE, data);
};

const update = async (data: SoundEffectUpdateData): Promise<SoundEffect | null> => {
  return await ipcRenderer.invoke(SoundEffectChannel.UPDATE, data);
};

const deleteById = async (id: string): Promise<boolean> => {
  return await ipcRenderer.invoke(SoundEffectChannel.DELETE, id);
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteById,
};
