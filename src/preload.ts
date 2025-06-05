import { contextBridge, ipcRenderer } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import TrackApi from './preload/track-api';
import {RedirectPath} from "@shared/models/redirect.model";

const generalApi = {
  triggerRedirect(path: RedirectPath){
    ipcRenderer.send(GeneralChannels.REDIRECT, path);
  },
  registerRedirect(callback: (path: RedirectPath) => void|Promise<void>){
    ipcRenderer.on(GeneralChannels.REDIRECT, (_, path) => {
      callback(path);
    })
  }
};

declare global {
  interface Window {
    GENERAL_API: typeof generalApi;
    TRACK_API: typeof TrackApi;
  }
}

contextBridge.exposeInMainWorld('GENERAL_API', generalApi);
contextBridge.exposeInMainWorld('trackApi', TrackApi);
