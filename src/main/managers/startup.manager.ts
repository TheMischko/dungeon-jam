import { BrowserWindow, ipcMain, WebContentsView } from 'electron';
import { getManagersInitConfig } from '../configs';
import { ViewManager } from './view.manager';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { JitterBuffer } from '../services/jitter-buffer';
import { Readable } from 'node:stream';
import { DiscordManager } from './discord.manager';
import { opus } from 'prism-media';
import Encoder = opus.Encoder;
import { getAudioConfig } from '../configs';

export class StartupManager {
  private static instance: StartupManager;

  private initialized: boolean = false;

  private constructor(
    private buildPath: string,
    private discordToken: string,
  ) {}

  public static getInstance(
    buildPath: string,
    discordToken: string,
  ): StartupManager {
    if (!StartupManager.instance) {
      StartupManager.instance = new StartupManager(buildPath, discordToken);
    }
    return StartupManager.instance;
  }

  public async initializeAllManagers(): Promise<boolean> {
    if (this.initialized) {
      console.log('[Init] Managers already initialized.');
      return true;
    }

    const initConfigurations = getManagersInitConfig(this.buildPath);

    for (const config of initConfigurations) {
      const result = await this.initializeManager(
        config.name,
        config.initFunction,
      );
      if (!result) {
        console.error(`[Init] Failed to initialize manager: ${config.name}`);
        return false;
      }
    }

    this.initialized = true;
    console.log('[Init] All managers initialized successfully.');
    return true;
  }

  public async initializeResources(): Promise<boolean> {
    const audioConfig = getAudioConfig();
    try {
      const encoder = new Encoder({
        channels: audioConfig.numChannels,
        frameSize: audioConfig.frameSize,
        rate: audioConfig.sampleRate,
      });

      // Setup WebSocket server with jitter buffer for network stability
      const { websocketServer, jitterBuffer } = setupWebsocketServer(
        async (data) => {
          const buffer = Buffer.from(data as ArrayLike<number>);

          if (jitterBuffer.addFrame(buffer)) {
            const frame = jitterBuffer.getFrame();
            if (frame) {
              encoder.write(frame);
            } else {
              console.warn(
                '[AudioPipeline] Buffer underrun - writing silence frame',
              );
              encoder.write(Buffer.alloc(FRAME_SIZE));
            }
          }

          // Log buffer health periodically
          if (Math.random() < 0.001) {
            const stats = jitterBuffer.getStats();
            console.log(
              `[JitterBuffer] Buffer: ${stats.currentBufferSize}/${stats.targetBufferSize} frames | Drop rate: ${stats.dropRate}`,
            );
          }
        },
      );

      const viewManager = await ViewManager.getInstance();

      await setupAudioCapture(
        viewManager.appWindow,
        viewManager.captureTab,
        viewManager.frontendTab.tab,
      );

      await setupDiscord(this.discordToken, encoder);
      return true;
    } catch (e) {
      console.error(`[Init] Resource initialization failed:`, e);
      return false;
    }
  }

  private async initializeManager(
    name: string,
    initFunction: () => Promise<void>,
  ): Promise<boolean> {
    try {
      console.log(`[Init] Creating ${name}...`);
      await initFunction();
      console.log(`[Init] ${name} initialized successfully.`);
      return true;
    } catch (e) {
      console.error(`[Init] ${name} initialization failed:`, e);
      return false;
    }
  }
}

async function setupAudioCapture(
  window: BrowserWindow,
  captureTab: WebContentsView,
  youtubeTab: WebContentsView,
) {
  try {
    const sourceId = youtubeTab.webContents.getMediaSourceId(
      captureTab.webContents,
    );

    captureTab.webContents.send('setup-audio-capture', {
      chromeMediaSource: 'tab',
      chromeMediaSourceId: sourceId,
    } as MediaTrackConstraints);
  } catch (e) {
    console.error('Audio capture failed:', e);
  }
}

function setupWebsocketServer(
  messageCallback?: (msg: RawData) => Promise<void>,
) {
  const websocketServer = new WebSocketServer({ port: 17253 });
  console.log('Websocket server started on', websocketServer.address());
  ipcMain.handle('get-websocket', () => websocketServer.address());

  // Create jitter buffer for handling network jitter
  // This smooths out variable packet arrival times and prevents audio dropout
  const jitterBuffer = new JitterBuffer(
    1920, // Frame size: 960 samples * 2 bytes (16-bit) = 1920 bytes
    200, // Target latency: 200ms buffer
  );

  websocketServer.on('connection', async (socket: WebSocket) => {
    console.log('Got a new connection to a Websocket server');
    socket.on('message', async (data: RawData) => {
      await (messageCallback
        ? messageCallback(data)
        : new Promise<void>((resolve) => resolve()));
    });
  });

  return { websocketServer, jitterBuffer };
}

async function setupDiscord(token: string, stream: Readable): Promise<void> {
  const discordManager = DiscordManager.getInstance();
  discordManager.createAudioPlayer();
  await discordManager.connect(token);
  const guilds = await discordManager.getGuildChannels();
  await discordManager.joinChannel(guilds[0].channels[0].id, stream);
}
