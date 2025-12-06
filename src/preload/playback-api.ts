import { StoredPlayback } from '@shared/models/track.model';
import { ipcRenderer } from 'electron';
import { PlaybackChannel } from '@shared/models/channels.model';
import { CaptureSettings } from '@shared/models/capture.model';

const loadState = async (): Promise<StoredPlayback> => {
  return await ipcRenderer.invoke(PlaybackChannel.LOAD);
};

const updateState = (newState: StoredPlayback): void => {
  ipcRenderer.send(PlaybackChannel.UPDATE, newState);
};

const updateCaptureSettings = (isMuted: boolean): void => {
  const settings: CaptureSettings = {
    isMuted,
  };
  ipcRenderer.send(PlaybackChannel.CAPTURE_SETTINGS, settings);
};

export default {
  loadState,
  updateState,
  updateCaptureSettings,
};
