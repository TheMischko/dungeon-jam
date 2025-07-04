import { contextBridge, ipcRenderer } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import TrackApi from './preload/track-api';
import { RedirectPath } from '@shared/models/redirect.model';
import AudioFileApi from './preload/audio-file-api';
import PlaybackApi from "./preload/playback-api";

const generalApi = {
  triggerRedirect(path: RedirectPath) {
    ipcRenderer.send(GeneralChannels.REDIRECT, path);
  },
  registerRedirect(callback: (path: RedirectPath) => void | Promise<void>) {
    ipcRenderer.on(GeneralChannels.REDIRECT, (_, path) => {
      callback(path);
    });
  },
};

declare global {
  interface Window {
    GENERAL_API: typeof generalApi;
    TRACK_API: typeof TrackApi;
    AUDIO_FILES_API: typeof AudioFileApi;
    PLAYBACK_API: typeof PlaybackApi;
  }
}

contextBridge.exposeInMainWorld('GENERAL_API', generalApi);
contextBridge.exposeInMainWorld('TRACK_API', TrackApi);
contextBridge.exposeInMainWorld('AUDIO_FILES_API', AudioFileApi);
contextBridge.exposeInMainWorld('PLAYBACK_API', PlaybackApi);