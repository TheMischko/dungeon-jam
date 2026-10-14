import { ipcRenderer } from 'electron';
import { UpdateChannel } from '@shared/models/channels.model';
import {
  AppUpdateInfo,
  UpdatePreferences,
} from '@shared/models/application.model';

const getUpdateInfo = async (): Promise<AppUpdateInfo[]> => {
  return await ipcRenderer.invoke(UpdateChannel.GET_UPDATE_INFO);
};

const updateApp = async (): Promise<void> => {
  return await ipcRenderer.invoke(UpdateChannel.UPDATE_APP);
};

const skipVersion = async (): Promise<void> => {
  return await ipcRenderer.invoke(UpdateChannel.SKIP_VERSION);
};

const getPreferences = async (): Promise<UpdatePreferences> => {
  return await ipcRenderer.invoke(UpdateChannel.GET_PREFERENCES);
};

export default {
  getUpdateInfo,
  updateApp,
  skipVersion,
  getPreferences,
};

