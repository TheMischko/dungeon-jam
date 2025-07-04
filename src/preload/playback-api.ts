import {StoredPlayback} from "@shared/models/track.model";
import {ipcRenderer} from "electron";
import {PlaybackChannel} from "@shared/models/channels.model";

const loadState = async (): Promise<StoredPlayback> => {
  return await ipcRenderer.invoke(PlaybackChannel.LOAD);
}

const updateState = (newState: StoredPlayback): void => {
  ipcRenderer.send(PlaybackChannel.UPDATE, newState);
}

export default {
  loadState,
  updateState
}