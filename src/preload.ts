import { contextBridge, ipcRenderer } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';

const generalApi = {
  getOS(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timeoutRef = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);

      ipcRenderer
        .invoke(GeneralChannels.GET_OS)
        .then((data: string) => {
          clearTimeout(timeoutRef);
          resolve(data);
        })
        .catch((err) => {
          clearTimeout(timeoutRef);
          reject(err);
        });
    });
  },
};

declare global {
  interface Window {
    GENERAL_API: typeof generalApi;
  }
}

contextBridge.exposeInMainWorld('GENERAL_API', generalApi);
