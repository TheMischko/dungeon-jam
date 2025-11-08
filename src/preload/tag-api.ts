import { QueryRequest } from '@shared/models/request.model';
import { Tag, TagData } from '@shared/models/tag.model';
import { ipcRenderer } from 'electron';
import { TagChannel } from '@shared/models/channels.model';

const getAllTags = async (query: QueryRequest): Promise<TagData[]> => {
  return await ipcRenderer.invoke(TagChannel.GET_ALL, query);
};

const getSubsetOfTags = async (
  column: keyof TagData,
  values: [],
): Promise<TagData[]> => {
  return await ipcRenderer.invoke(TagChannel.GET_SUBSET, column, values);
};

const insertTag = async (data: Tag): Promise<TagData> => {
  return await ipcRenderer.invoke(TagChannel.INSERT, data);
};

const getTagSuggestion = async (titlePart: string): Promise<TagData[]> => {
  return await ipcRenderer.invoke(TagChannel.SUGGESTION, titlePart);
};

const deleteTag = async (tagId: string): Promise<void> => {
  return await ipcRenderer.invoke(TagChannel.DELETE_ONE, tagId);
};

const clearOrphanedTags = async (): Promise<number> => {
  return await ipcRenderer.invoke(TagChannel.CLEAR_ORPHANS);
};

export default {
  getAllTags,
  getSubsetOfTags,
  insertTag,
  getTagSuggestion,
  deleteTag,
  clearOrphanedTags,
};
