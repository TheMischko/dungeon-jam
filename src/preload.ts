import { contextBridge, ipcRenderer } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import TrackApi from './preload/track-api';
import { RedirectRequest } from '@shared/models/redirect.model';
import AudioFileApi from './preload/audio-file-api';
import PlaybackApi from './preload/playback-api';
import PlaylistApi from './preload/playlist-api';
import TagApi from './preload/tag-api';
import DiscordApi from './preload/discord-api';

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
  }
}

contextBridge.exposeInMainWorld('GENERAL_API', generalApi);
contextBridge.exposeInMainWorld('TRACK_API', TrackApi);
contextBridge.exposeInMainWorld('AUDIO_FILES_API', AudioFileApi);
contextBridge.exposeInMainWorld('PLAYBACK_API', PlaybackApi);
contextBridge.exposeInMainWorld('PLAYLIST_API', PlaylistApi);
contextBridge.exposeInMainWorld('TAG_API', TagApi);
contextBridge.exposeInMainWorld('DISCORD_API', DiscordApi);
