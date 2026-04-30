import { ipcRenderer } from 'electron';
import { ImageChannel } from '@shared/models/channels.model';

const fetchImage = async (imagePath: string): Promise<string | null> => {
  return await ipcRenderer.invoke(ImageChannel.FETCH_IMAGE, imagePath);
};

const openPicker = async (): Promise<string | null> => {
  return await ipcRenderer.invoke(ImageChannel.OPEN_PICKER);
};

const processAndSave = async (
  imagePath: string,
  entityType: string
): Promise<string> => {
  return await ipcRenderer.invoke(
    ImageChannel.PROCESS_AND_SAVE,
    imagePath,
    entityType
  );
};

const deleteImage = async (imagePath: string): Promise<void> => {
  return await ipcRenderer.invoke(ImageChannel.DELETE, imagePath);
};

export default {
  openPicker,
  processAndSave,
  deleteImage,
  fetchImage,
};
