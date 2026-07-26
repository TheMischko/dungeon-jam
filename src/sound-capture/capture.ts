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

interface CaptureWindowAPI {
  setupAudioCapture: (callback: (constraints: any) => void) => void;
  getWebSocketAddress: () => Promise<any>;
  onCaptureSettingsChanged: (callback: (settings: { isLocalMuted: boolean }) => void) => void;
}

// @ts-ignore
declare const window: Window & { API: CaptureWindowAPI };

async function createCapture(){
  try {
    const constraints: { chromeMediaSource: string, chromeMediaSourceId: string } = await new Promise(
      resolve => {
        window.API.setupAudioCapture(resolve);
      }
    );

    const webSocket = await connectToWebSocketServer();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: constraints.chromeMediaSource,
          chromeMediaSourceId: constraints.chromeMediaSourceId
        }
      } as unknown as MediaTrackConstraints,
      video: false
    });

    const audioContext = new AudioContext({
      latencyHint: "playback",
      sampleRate: SAMPLE_RATE
    });
    console.log(`[CAPTURE] AudioContext created with sample rate: ${audioContext.sampleRate}`);
    const audioOutputNode = audioContext.createGain();

    await audioContext.audioWorklet.addModule("./PCMStream.worklet.js");
    const pcmStreamNode = new AudioWorkletNode(
      audioContext,
      "pcm-stream",
      {
        parameterData: {
          bufferSize: FRAME_SIZE
        },
        channelCount: NUM_CHANNELS,
        channelCountMode: "explicit",
        channelInterpretation: "speakers"

      }
    );

    pcmStreamNode.port.onmessage = (event) => {
      webSocket.send(event.data);
    }
    pcmStreamNode.port.onmessageerror = (event) => {
      console.error("PCM stream error:", event);
    };

    audioOutputNode.connect(pcmStreamNode);

    const output = audioContext.createGain();
    const audioSource = audioContext.createMediaStreamSource(stream);

    audioSource.connect(output);

    output.connect(audioOutputNode);

    console.log('Audio capture started');
    return {
      audioContext,
      audioOutputNode,
    }
  } catch (e) {
    console.error('Audio capture failed:', e);
  }
}

function createLocalLoopback(audioContext: AudioContext, audioOutputNode: GainNode) {
  console.log('Creating local loopback.');
  const mediaDestination = audioContext.createMediaStreamDestination();

  // Create a gain node to control loopback volume separately from capture
  const loopbackGain = audioContext.createGain();
  loopbackGain.gain.value = 1; // Default to full volume

  audioOutputNode.connect(loopbackGain);
  loopbackGain.connect(mediaDestination);

  const audioOutputElement = document.createElement("audio");
  document.body.appendChild(audioOutputElement);
  audioOutputElement.srcObject = mediaDestination.stream;
  audioOutputElement.onloadedmetadata = async () => {
    await audioOutputElement.play();
    console.log('Audio loopback active.');
  }

  return {
    audioElement: audioOutputElement,
    loopbackGain
  };
}

async function connectToWebSocketServer(): Promise<WebSocket> {
  const address = await window.API.getWebSocketAddress();
  const ws = new WebSocket(`ws://localhost:${address.port}`);
  ws.onopen = () => {
    console.log(
      `Websocket connection opened at: 'ws://localhost:${address.port}'`,
    );
  }
  ws.addEventListener("close", (event) => {
    console.log(`WebSocket closed with code ${event.code}`);
  })
  return ws;
}

async function createDiscordStream(): Promise<void> {

}

let loopbackGain: GainNode | null = null;

createCapture()
  .then((capture) => {
    if (!capture) return;

    // Auto-enable loopback on startup
    const loopback = createLocalLoopback(capture.audioContext, capture.audioOutputNode);
    loopbackGain = loopback.loopbackGain;

    // Listen for capture settings changes from frontend
    window.API.onCaptureSettingsChanged((settings) => {
      if (loopbackGain) {
        // Set loopback gain: 0 if locally muted (disable output), 1 if unmuted (full output)
        // Volume is controlled by the application being captured
        loopbackGain.gain.value = settings.isLocalMuted ? 0 : 1;
        console.log(`[LOOPBACK] Settings updated: localMuted=${settings.isLocalMuted}, gain=${loopbackGain.gain.value}`);
      }
    });

    // Keep legacy button for manual testing
    document.getElementById('start-loopback')?.addEventListener("click", () => {
      if(!capture) return;
      createLocalLoopback(capture.audioContext, capture.audioOutputNode);
    })
  })
  .catch(console.error);

