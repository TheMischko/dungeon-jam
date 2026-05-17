import { BrowserWindow, ipcMain, WebContentsView } from 'electron';
import { getManagersInitConfig } from '../configs';
import { ViewManager } from './view.manager';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { DiscordManager } from './discord.manager';
import { opus } from 'prism-media';
import Encoder = opus.Encoder;
import { getAudioConfig } from '../configs';
import { Logger } from '../utils/logger';
import { DiscordTokenManager } from './discord-token.manager';
import { startLocalServer, stopLocalServer } from '../services/local-server';

export class StartupManager {
  private static instance: StartupManager;

  private initialized: boolean = false;
  private localServerUrl: string = '';
  private logger = new Logger('StartupManager', 'green');
  private websocketServer: WebSocketServer | undefined;

  private constructor(
    private buildPath: string,
    private env: string
  ) {}

  public static get tabsServerUrl(): string {
    return this.instance.localServerUrl;
  }

  public static getInstance(buildPath: string, env: string): StartupManager {
    if (!StartupManager.instance) {
      StartupManager.instance = new StartupManager(buildPath, env);
    }
    return StartupManager.instance;
  }

  public async initializeAllManagers(): Promise<boolean> {
    if (this.initialized) {
      this.logger.log('Managers already initialized');
      return true;
    }

    this.localServerUrl = await startLocalServer(this.buildPath, this.env);

    const initConfigurations = getManagersInitConfig(this.buildPath);

    for (const config of initConfigurations) {
      const result = await this.initializeManager(
        config.name,
        config.initFunction
      );
      if (!result) {
        this.logger.logErrorMessage('Failed to initialize manager', {
          manager: config.name,
        });
        return false;
      }
    }

    this.initialized = true;
    this.logger.log('All managers initialized successfully');
    return true;
  }

  public async initializeResources(): Promise<boolean> {
    const audioConfig = getAudioConfig();
    let currentResource: string = '';
    try {
      currentResource = 'Encoder';
      const encoder = new Encoder({
        channels: audioConfig.numChannels,
        frameSize: audioConfig.frameSize,
        rate: audioConfig.sampleRate,
      });
      encoder.on('error', (err) => {
        this.logger.logErrorMessage('Audio Encoder error', { error: err });
      });
      encoder.on('close', () => this.logger.log('Audio Encoder closed'));
      encoder.on('end', () => this.logger.log('Audio Encoder ended'));
      encoder.on('drain', () => this.logger.log('Audio Encoder drain event'));

      currentResource = 'DiscordManager';
      const discordManager = await DiscordManager.getInstance();

      // Setup WebSocket server with jitter buffer for network stability
      currentResource = 'Websocket server';
      this.websocketServer = setupWebsocketServer(async (data) => {
        const buffer = Buffer.from(data as ArrayLike<number>);
        await discordManager.handleVoiceData(buffer);
      }, this.logger).websocketServer;

      const viewManager = await ViewManager.getInstance();

      currentResource = 'Audio capture';
      await setupAudioCapture(
        viewManager.appWindow,
        viewManager.captureTab,
        viewManager.frontendTab.tab,
        this.logger
      );
      return true;
    } catch (e) {
      this.logger.logErrorMessage(
        `Resource ${currentResource} initialization failed`,
        {
          error: e,
        }
      );
      return false;
    }
  }

  public async afterAllInitialized(): Promise<void> {
    this.logger.log('Performing post-initialization tasks');
    const discordTokenManager = await DiscordTokenManager.getInstance();
    await discordTokenManager.connectActiveTokens();
  }

  public async onAppEnd(): Promise<void> {
    this.websocketServer?.close();
    await stopLocalServer();
  }

  private async initializeManager(
    name: string,
    initFunction: (env: string) => Promise<void>
  ): Promise<boolean> {
    try {
      this.logger.log(`Creating ${name}...`);
      await initFunction(this.env);
      this.logger.log(`${name} initialized successfully`);
      return true;
    } catch (e) {
      this.logger.logErrorMessage(`${name} initialization failed`, {
        error: e,
      });
      return false;
    }
  }
}

async function setupAudioCapture(
  window: BrowserWindow,
  captureTab: WebContentsView,
  youtubeTab: WebContentsView,
  logger: Logger
) {
  try {
    const sourceId = youtubeTab.webContents.getMediaSourceId(
      captureTab.webContents
    );

    captureTab.webContents.send('setup-audio-capture', {
      chromeMediaSource: 'tab',
      chromeMediaSourceId: sourceId,
    } as MediaTrackConstraints);
  } catch (e) {
    logger.logErrorMessage('Audio capture failed', { error: e });
  }
}

function setupWebsocketServer(
  messageCallback?: (msg: RawData) => Promise<void>,
  logger?: Logger
) {
  const websocketServer = new WebSocketServer({ port: 0 });
  const address = websocketServer.address();
  logger?.log('Websocket server started', { address });
  ipcMain.handle('get-websocket', () => websocketServer.address());

  websocketServer.on('connection', async (socket: WebSocket) => {
    logger?.log('Got a new connection to a Websocket server');
    socket.on('message', async (data: RawData) => {
      await (messageCallback
        ? messageCallback(data)
        : new Promise<void>((resolve) => resolve()));
    });
  });

  return { websocketServer };
}
