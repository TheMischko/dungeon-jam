import { ipcRenderer } from 'electron';
import { UpdateChannel } from '@shared/models/channels.model';
import { AppUpdateInfo } from '@shared/models/application.model';

const getUpdateInfo = async (): Promise<AppUpdateInfo[]> => {
  return await ipcRenderer.invoke(UpdateChannel.GET_UPDATE_INFO);
};

const updateApp = async (): Promise<void> => {
  return await ipcRenderer.invoke(UpdateChannel.UPDATE_APP);
};

export default {
  getUpdateInfo,
  updateApp,
};

