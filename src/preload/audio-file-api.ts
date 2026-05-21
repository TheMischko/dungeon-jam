import { ipcRenderer, webUtils } from 'electron';
import { AudioFileChannel } from '@shared/models/channels.model';
import { AudioTrack, FileBase64 } from '@shared/models/track.model';

const audioRegExp = new RegExp('audio/.*');

const fetchAudioData = async (paths: string[]): Promise<AudioTrack[]> => {
  return await ipcRenderer.invoke(AudioFileChannel.FETCH_DATA, paths);
};

const registerAudioFileDrop = (callback: (paths: AudioTrack[]) => void) => {
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    const paths = [...e.dataTransfer!.files]
      .filter((file) => audioRegExp.test(file.type))
      .map((file) => webUtils.getPathForFile(file));
    const data = await fetchAudioData([...paths]);
    callback(data);
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
};

const registerFileDrop = (
  accept: string,
  callback: (paths: string[]) => void
) => {
  const acceptRegExp = new RegExp(accept);
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    const paths = [...e.dataTransfer!.files]
      .filter((file) => acceptRegExp.test(file.type))
      .map((file) => webUtils.getPathForFile(file));
    callback(paths);
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
};

const uploadTracks = async (tracks: AudioTrack[]) => {
  return await ipcRenderer.invoke(AudioFileChannel.UPLOAD, tracks);
};

const loadFileBase64 = async (filePath: string): Promise<FileBase64> => {
  return await ipcRenderer.invoke(AudioFileChannel.LOAD_FILE, filePath);
};

const openAudioFileDialog = async (): Promise<AudioTrack[]> => {
  return await ipcRenderer.invoke(AudioFileChannel.OPEN_AUDIO_FILES_PICKER);
};

export default {
  fetchAudioData,
  registerAudioFileDrop,
  registerFileDrop,
  uploadTracks,
  loadFileBase64,
  openAudioFileDialog,
};
