import { ipcRenderer, webUtils } from 'electron';
import { AudioFileChannel } from '@shared/models/channels.model';
import { AudioTrack } from '@shared/models/track.model';

const audioRegExp = new RegExp('audio/.*');

const fetchAudioData = async (paths: string[]): Promise<AudioTrack[]> => {
  return await ipcRenderer.invoke(AudioFileChannel.FETCH_DATA, paths);
};

const registerFileDrop = (callback: (paths: AudioTrack[]) => void) => {
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

const uploadTracks = async (tracks: AudioTrack[]) => {
  return await ipcRenderer.invoke(AudioFileChannel.UPLOAD, tracks);
};

export default {
  fetchAudioData,
  registerFileDrop,
  uploadTracks,
};
