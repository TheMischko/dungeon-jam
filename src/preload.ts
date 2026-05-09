import { contextBridge, ipcRenderer } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import TrackApi from './preload/track-api';
import { RedirectRequest } from '@shared/models/redirect.model';
import { OperatingSystem } from '@shared/models/application.model';
import AudioFileApi from './preload/audio-file-api';
import PlaybackApi from './preload/playback-api';
import PlaylistApi from './preload/playlist-api';
import TagApi from './preload/tag-api';
import DiscordApi from './preload/discord-api';
import DiscordTokenApi from './preload/discord-token-api';
import SoundEffectApi from './preload/sound-effect-api';
import ImageApi from './preload/image-api';

const generalApi = {
  triggerRedirect(request: RedirectRequest) {
    ipcRenderer.send(GeneralChannels.REDIRECT, request);
  },
  registerRedirect(
    callback: (request: RedirectRequest) => void | Promise<void>,
  ) {
    ipcRenderer.on(GeneralChannels.REDIRECT, (_, request) => {
      callback(request);
    });
  },
  onApplicationReady(callback: () => void | Promise<void>) {
    ipcRenderer.on(GeneralChannels.APP_READY, () => {
      callback();
    });
  },
  closeApp(): Promise<void> {
    return ipcRenderer.invoke(GeneralChannels.CLOSE_APP);
  },
  minimizeApp(): Promise<void> {
    return ipcRenderer.invoke(GeneralChannels.MINIMIZE_APP);
  },
  maximizeApp(): Promise<void> {
    return ipcRenderer.invoke(GeneralChannels.MAXIMIZE_APP);
  },
  unmaximizeApp(): Promise<void> {
    return ipcRenderer.invoke(GeneralChannels.UNMAXIMIZE_APP);
  },
  onAppMinimized(callback: (isMinimized: boolean) => void | Promise<void>) {
    ipcRenderer.on(GeneralChannels.APP_MINIMIZED, (_, isMinimized: boolean) => {
      callback(isMinimized);
    });
  },
  onAppMaximized(callback: (isMaximized: boolean) => void | Promise<void>) {
    ipcRenderer.on(GeneralChannels.APP_MAXIMIZED, (_, isMaximized: boolean) => {
      callback(isMaximized);
    });
  },
  getOS(): Promise<OperatingSystem> {
    return ipcRenderer.invoke(GeneralChannels.GET_OS);
  },
};

declare global {
  interface Window {
    GENERAL_API: typeof generalApi;
    TRACK_API: typeof TrackApi;
    AUDIO_FILES_API: typeof AudioFileApi;
    PLAYBACK_API: typeof PlaybackApi;
    PLAYLIST_API: typeof PlaylistApi;
    TAG_API: typeof TagApi;
    DISCORD_API: typeof DiscordApi;
    DISCORD_TOKEN_API: typeof DiscordTokenApi;
    SOUND_EFFECT_API: typeof SoundEffectApi;
    IMAGE_API: typeof ImageApi;
  }
}

contextBridge.exposeInMainWorld('GENERAL_API', generalApi);
contextBridge.exposeInMainWorld('TRACK_API', TrackApi);
contextBridge.exposeInMainWorld('AUDIO_FILES_API', AudioFileApi);
contextBridge.exposeInMainWorld('PLAYBACK_API', PlaybackApi);
contextBridge.exposeInMainWorld('PLAYLIST_API', PlaylistApi);
contextBridge.exposeInMainWorld('TAG_API', TagApi);
contextBridge.exposeInMainWorld('DISCORD_API', DiscordApi);
contextBridge.exposeInMainWorld('DISCORD_TOKEN_API', DiscordTokenApi);
contextBridge.exposeInMainWorld('SOUND_EFFECT_API', SoundEffectApi);
contextBridge.exposeInMainWorld('IMAGE_API', ImageApi);
