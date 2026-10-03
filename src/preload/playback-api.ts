import {
  StoredPlayback,
  StoredTransitionSettings,
} from '@shared/models/track.model';
import { ipcRenderer } from 'electron';
import { PlaybackChannel } from '@shared/models/channels.model';
import { CaptureSettings } from '@shared/models/capture.model';

const loadState = async (): Promise<StoredPlayback> => {
  return await ipcRenderer.invoke(PlaybackChannel.LOAD);
};

const updateState = (newState: StoredPlayback): void => {
  ipcRenderer.send(PlaybackChannel.UPDATE, newState);
};

const updateCaptureSettings = (isLocalMuted: boolean): void => {
  const settings: CaptureSettings = {
    isLocalMuted,
  };
  ipcRenderer.send(PlaybackChannel.CAPTURE_SETTINGS, settings);
};

const loadTransitionSettings = async (): Promise<StoredTransitionSettings> => {
  return await ipcRenderer.invoke(PlaybackChannel.LOAD_TRANSITION);
};

const updateTransitionSettings = (
  newState: StoredTransitionSettings
): void => {
  ipcRenderer.send(PlaybackChannel.UPDATE_TRANSITION, newState);
};

const onTransitionChanged = (
  callback: (settings: StoredTransitionSettings) => void | Promise<void>
): void => {
  ipcRenderer.on(
    PlaybackChannel.TRANSITION_SYNC,
    (_, settings: StoredTransitionSettings) => {
      callback(settings);
    }
  );
};

export default {
  loadState,
  updateState,
  updateCaptureSettings,
  loadTransitionSettings,
  updateTransitionSettings,
  onTransitionChanged,
};


