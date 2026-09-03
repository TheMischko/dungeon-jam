import { net, protocol } from 'electron';
import { TrackManager } from './track.manager';
import fs from 'fs';
import { pathToFileURL } from 'node:url';
import { Logger } from '../utils/logger';

export class MediaProtocolManager {
  private static _instance: MediaProtocolManager;

  private logger = new Logger('MediaProtocolManager', 'magentaBright');

  constructor(private trackManager: TrackManager) {}

  public static async getInstance(): Promise<MediaProtocolManager> {
    if (!MediaProtocolManager._instance) {
      const trackManager = await TrackManager.getInstance();
      MediaProtocolManager._instance = new MediaProtocolManager(trackManager);
      MediaProtocolManager._instance.registerHandlers();
    }
    return MediaProtocolManager._instance;
  }

  private registerHandlers(): void {
    protocol.handle('media', async (request) => {
      this.logger.log(`Handling media request for URL: ${request.url}`);
      const url = new URL(request.url);
      if (url.hostname !== 'tracks') {
        this.logger.logErrorMessage(
          `Invalid media request hostname: ${url.hostname}`
        );
        return new Response(null, { status: 403 });
      }

      const id = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
      const track = await this.trackManager.get(id);
      if (!track || !fs.existsSync(track.url)) {
        this.logger.logErrorMessage(
          `Requested media not found for URL: ${url.pathname}`,
          { id, track }
        );
        return new Response(null, { status: 404 });
      }
      return net.fetch(pathToFileURL(track.url).toString(), {
        headers: request.headers,
      });
    });
  }

  public static RegisterMediaProtocol(): void {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'media',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true,
          stream: true,
        },
      },
    ]);
  }
}
