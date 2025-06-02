import { app, BrowserWindow, ipcMain, WebContentsView } from 'electron';
import * as path from 'node:path';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { Readable } from 'node:stream';
import { opus } from 'prism-media';
import Encoder = opus.Encoder;
import { configDotenv } from 'dotenv';
import { DiscordManager } from './main/managers/discord.manager';
import { ViewManager } from './main/managers/view.manager';

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
  ipcMain.handle('get-websocket', () => websocketServer.address());

  websocketServer.on('connection', async (socket: WebSocket) => {
    socket.on('message', async (data: RawData) => {
      await (messageCallback
        ? messageCallback(data)
        : new Promise<void>((resolve) => resolve()));
    });
  });
}

async function setupDiscord(token: string, stream: Readable): Promise<void> {
  const discordManager = new DiscordManager();
  discordManager.createAudioPlayer();
  await discordManager.connect(token);
  const guilds = await discordManager.getGuildChannels();
  await discordManager.joinChannel(guilds[0].channels[0].id, stream);
}

app.on('ready', async () => {
  const encoder = new Encoder({
    channels: NUM_CHANNELS,
    frameSize: FRAME_SIZE,
    rate: SAMPLE_RATE,
  });

  setupWebsocketServer(async (data) => {
    const buffer = Buffer.from(data as ArrayLike<number>);
    encoder.write(buffer);
  });
  const preload = path.join(__dirname, 'preload.js');
  const viewManager = await ViewManager.getInstance({
    width: 1280,
    height: 800,
    defaultPreferences: {
      contextIsolation: true,
      preload,
    },
    indexHTML,
  });

  await setupAudioCapture(
    viewManager.appWindow,
    viewManager.captureTab,
    viewManager.frontendTab.tab,
  );
  await setupDiscord(DISCORD_TOKEN, encoder);
  // await TrackManager.getInstance();
});
