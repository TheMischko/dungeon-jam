import { app, BrowserWindow, ipcMain, WebContentsView } from 'electron';
import * as path from 'node:path';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { Readable } from 'node:stream';
import { opus } from 'prism-media';
import Encoder = opus.Encoder;
import { configDotenv } from 'dotenv';
import { DiscordManager } from './main/managers/discord.manager';
import { ViewManager } from './main/managers/view.manager';
import { TrackManager } from './main/managers/track.manager';
import { PlaylistManager } from './main/managers/playlist.manager';
import { RedirectManager } from './main/managers/redirect.manager';
import { FilesManager } from './main/managers/files.manager';
import { StoredPlaybackManager } from './main/managers/stored-playback.manager';
import { TagsManager } from './main/managers/tags.manager';
import { JitterBuffer } from './main/services/jitter-buffer';

configDotenv();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'ERROR';
const ENV = process.env.ENV || 'production';
console.log('DISCORD_TOKEN', DISCORD_TOKEN);

/** Sample rate of the audio context */
const SAMPLE_RATE = 48000;
/** Number of channels for the audio context */
const NUM_CHANNELS = 2;
/** 16 bit audio data */
const BIT_DEPTH = 16;
/** Number of bytes per audio sample */
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;
/** 20ms Opus frame duration */
const FRAME_DURATION = 20;
/** Duration of each audio frame in seconds */
const FRAME_DURATION_SECONDS = FRAME_DURATION / 1000;
/**
 * Size in bytes of each frame of audio
 * We stream audio to the main context as 16bit PCM data
 * At 48KHz with a frame duration of 20ms (or 0.02s) and a stereo signal
 * our `frameSize` is calculated by:
 * `SAMPLE_RATE * FRAME_DURATION_SECONDS * NUM_CHANNELS / BYTES_PER_SAMPLE`
 * or:
 * `48000 * 0.02 * 2 / 2 = 960`
 */
const FRAME_SIZE =
  (SAMPLE_RATE * FRAME_DURATION_SECONDS * NUM_CHANNELS) / BYTES_PER_SAMPLE;

const indexHTML = path.join(__dirname, 'sound-capture', 'index.html');

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
  const discordManager = new DiscordManager();
  discordManager.createAudioPlayer();
  await discordManager.connect(token);
  const guilds = await discordManager.getGuildChannels();
  await discordManager.joinChannel(guilds[0].channels[0].id, stream);
}

app.on('ready', async () => {
  // TO-DO: Move down
  await StoredPlaybackManager.getInstance();
  const encoder = new Encoder({
    channels: NUM_CHANNELS,
    frameSize: FRAME_SIZE,
    rate: SAMPLE_RATE,
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

  const preload = path.join(__dirname, 'preload.js');
  const viewManager = await ViewManager.getInstance({
    width: 1280,
    height: 800,
    defaultPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
    indexHTML,
  });

  await setupAudioCapture(
    viewManager.appWindow,
    viewManager.captureTab,
    viewManager.frontendTab.tab,
  );
  try {
    await setupDiscord(DISCORD_TOKEN, encoder);
  } catch (e) {
    console.error(e);
  }
  await TrackManager.getInstance();
  await PlaylistManager.getInstance();
  await RedirectManager.getInstance();
  await FilesManager.getInstance();
  await TagsManager.getInstance();
  //TO-DO: Postpone loading UI until all managers are loaded.
});
