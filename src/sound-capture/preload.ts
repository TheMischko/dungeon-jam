import { contextBridge, ipcRenderer } from 'electron';
import { AddressInfo } from 'ws';
import { CaptureChannel } from '@shared/models/channels.model';
import { CaptureSettings } from '@shared/models/capture.model';

const setupAudioCapture = (callback: (constrains: any) => void) => {
  ipcRenderer.on('setup-audio-capture', (_, constraints) => {
    callback(constraints);
  });
};

const getWebSocketAddress = (): Promise<AddressInfo> => {
  return ipcRenderer.invoke('get-websocket');
};

const onCaptureSettingsChanged = (callback: (settings: CaptureSettings) => void) => {
  ipcRenderer.on(CaptureChannel.SETTINGS, (_, settings: CaptureSettings) => {
    callback(settings);
  });
};

const api = {
  setupAudioCapture,
  getWebSocketAddress,
  onCaptureSettingsChanged,
};

declare global {
  interface Window {
    API: typeof api;
  }
}

contextBridge.exposeInMainWorld('API', api);
