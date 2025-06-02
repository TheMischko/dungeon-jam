import { DatabaseWrapper } from '../database/database';
import { Track } from '@shared/models/track.model';
import { ipcMain } from 'electron';
import { TrackChannel } from '@shared/models/channels.model';
import { v4 as uuid } from 'uuid';

export class TrackManager {
  private static _instance: TrackManager;

  private constructor(private database: DatabaseWrapper) {}

  public static async getInstance() {
    if (!TrackManager._instance) {
      const database = await DatabaseWrapper.getInstance();
      TrackManager._instance = new TrackManager(database);
      TrackManager._instance.registerChannels();
    }
    return TrackManager._instance!;
  }

  private registerChannels(): void {
    ipcMain.handle(TrackChannel.GET_ALL, () => {
      return this.getAll();
    });

    ipcMain.handle(TrackChannel.GET_BY_ID, (_, id: string) => {
      return this.get(id);
    });

    ipcMain.handle(
      TrackChannel.INSERT,
      async (_, name: string, url: string, author?: string) => {
        return await this.insert(name, url, author);
      },
    );
  }

  getAll(): Track[] {
    return this.database.readTable<Track[]>('tracks') ?? [];
  }

  get(id: string): Track | undefined {
    return this.getAll()?.find((track) => track.id === id);
  }

  async insert(name: string, url: string, author?: string): Promise<Track> {
    const tracks = this.getAll();
    const id = uuid();
    const newTrack = {
      id,
      name,
      url,
      author,
    };
    tracks.push(newTrack);
    await this.database.updateTable('tracks', tracks);
    return this.get(id)!;
  }
}
