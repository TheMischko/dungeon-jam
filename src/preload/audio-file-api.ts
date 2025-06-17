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
    const files = [...e.dataTransfer!.files];
    console.log(files);
    const paths = files
      .filter((file) => audioRegExp.test(file.type))
      .map((file) => webUtils.getPathForFile(file));
    console.log(paths);
    const data = await fetchAudioData([...paths]);
    console.log(data);
    callback(data);
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
};

export default {
  fetchAudioData,
  registerFileDrop,
};
