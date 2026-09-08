import { net, protocol } from 'electron';
import { TrackManager } from './track.manager';
import fs from 'fs';
import { pathToFileURL } from 'node:url';
import { Logger } from '../utils/logger';
import { SoundEffectManager } from './sound-effect.manager';

export class MediaProtocolManager {
  private static _instance: MediaProtocolManager;

  private logger = new Logger('MediaProtocolManager', 'magentaBright');

  // Must be registered before any webContents navigates (see getInstance), so it
  // cannot depend on TrackManager/SoundEffectManager being initialized yet.
  public static getInstance(): MediaProtocolManager {
    if (!MediaProtocolManager._instance) {
      MediaProtocolManager._instance = new MediaProtocolManager();
      MediaProtocolManager._instance.registerHandlers();
    }
    return MediaProtocolManager._instance;
  }

  private registerHandlers(): void {
    protocol.handle('media', async (request) => {
      this.logger.log(`Handling media request for URL: ${request.url}`);
      const url = new URL(request.url);
      const id = decodeURIComponent(url.pathname.replace(/^\/+/, ''));

      switch (url.hostname) {
        case MediaProtocolResource.TRACKS:
          return await this.handleTrackRequest(id, url, request);
        case MediaProtocolResource.SOUND_EFFECTS:
          return await this.handleSoundEffectRequest(id, url, request);
        default:
          this.logger.logErrorMessage(
            `Invalid media request hostname: ${url.hostname}`
          );
          return new Response(null, { status: 403 });
      }
    });
  }

  private async handleTrackRequest(
    id: string,
    url: URL,
    request: Request
  ): Promise<Response> {
    const trackManager = await TrackManager.getInstance();
    const track = await trackManager.get(id);
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
  }

  private async handleSoundEffectRequest(
    id: string,
    url: URL,
    request: GlobalRequest
  ): Promise<Response> {
    const soundEffectManager = await SoundEffectManager.getInstance();
    const soundEffect = await soundEffectManager.getById(id);
    if (!soundEffect || !fs.existsSync(soundEffect.url)) {
      this.logger.logErrorMessage(
        `Requested media not found for URL: ${url.pathname}`,
        { id, soundEffect }
      );
      return new Response(null, { status: 404 });
    }
    return net.fetch(pathToFileURL(soundEffect.url).toString(), {
      headers: request.headers,
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
          bypassCSP: true,
        },
      },
    ]);
    console.log('Media protocol registered successfully.');
  }
}

enum MediaProtocolResource {
  TRACKS = 'tracks',
  SOUND_EFFECTS = 'sound-effects',
}
