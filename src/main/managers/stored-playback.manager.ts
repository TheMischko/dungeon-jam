import { DatabaseWrapper } from '../database/database';
import { ipcMain } from 'electron';
import { PlaybackChannel } from '@shared/models/channels.model';
import {
  PlaybackSettings,
  RepeatState,
  StoredPlayback,
  StoredTransitionSettings,
} from '@shared/models/track.model';
import { Logger } from '../utils/logger';
import { withAppError } from '../utils/ipc-handler';
import { ViewManager } from './view.manager';

export class StoredPlaybackManager {
  private static _instance: StoredPlaybackManager;
  private readonly TABLE_NAME = 'playback';
  private readonly logger = new Logger('StoredPlayback', 'green');

  constructor(private readonly database: DatabaseWrapper) {}

  public static async getInstance(): Promise<StoredPlaybackManager> {
    if (!StoredPlaybackManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      const manager = new StoredPlaybackManager(database);
      manager.registerChannels();
      StoredPlaybackManager._instance = manager;
    }
    return StoredPlaybackManager._instance!;
  }

  private registerChannels() {
    ipcMain.handle(
      PlaybackChannel.LOAD,
      withAppError<StoredPlayback>(() => {
        return this.loadPlayback();
      })
    );
    ipcMain.on(PlaybackChannel.UPDATE, async (_, newState: StoredPlayback) => {
      await this.updatePlayback(newState);
    });
    ipcMain.handle(
      PlaybackChannel.LOAD_TRANSITION,
      withAppError(() => {
        return this.loadTransitionSettings();
      })
    );
    ipcMain.on(
      PlaybackChannel.UPDATE_TRANSITION,
      async (_, newState: StoredTransitionSettings) => {
        await this.updateTransitionSettings(newState);
      }
    );
  }

  private readonly defaultState: PlaybackSettings = {
    repeat: RepeatState.NONE,
    shuffle: false,
    volume: 1,
    crossFadeDuration: 1,
    fadeInDuration: 1,
  };

  private load(): PlaybackSettings {
    return this.database.readTable<PlaybackSettings>(this.TABLE_NAME)!;
  }

  private loadPlayback(): StoredPlayback {
    const data = this.load();
    return {
      repeat: data.repeat ?? this.defaultState.repeat,
      volume: data.volume ?? this.defaultState.volume,
      shuffle: data.shuffle ?? this.defaultState.shuffle,
    };
  }

  private loadTransitionSettings(): StoredTransitionSettings {
    const data = this.load();
    return {
      fadeInDuration: data.fadeInDuration ?? this.defaultState.fadeInDuration,
      crossFadeDuration:
        data.crossFadeDuration ?? this.defaultState.crossFadeDuration,
    };
  }

  private async update(newState: PlaybackSettings): Promise<void> {
    this.logger.log('Updating stored state', { newState });
    await this.database.updateTable(this.TABLE_NAME, {
      ...this.defaultState,
      ...newState,
    });
  }

  private async updatePlayback(newState: StoredPlayback): Promise<void> {
    const currentState = this.load();
    return await this.update({
      ...currentState,
      ...newState,
    });
  }

  private async updateTransitionSettings(newState: StoredTransitionSettings) {
    const currentState = this.load();
    await this.update({
      ...currentState,
      ...newState,
    });
    await this.emitTransitionChangedSync(newState);
  }

  private async emitTransitionChangedSync(
    state: StoredTransitionSettings
  ): Promise<void> {
    const viewManager = await ViewManager.getInstance();
    viewManager.broadcast(PlaybackChannel.TRANSITION_SYNC, null, state);
  }
}
