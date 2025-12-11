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

export interface AudioConfig {
  sampleRate: number;
  numChannels: number;
  bitDepth: number;
  bytesPerSample: number;
  frameDuration: number;
  frameDurationSeconds: number;
  frameSize: number;
}

export const getAudioConfig = (): AudioConfig => {
  return {
    sampleRate: SAMPLE_RATE,
    numChannels: NUM_CHANNELS,
    bitDepth: BIT_DEPTH,
    bytesPerSample: BYTES_PER_SAMPLE,
    frameDuration: FRAME_DURATION,
    frameDurationSeconds: FRAME_DURATION_SECONDS,
    frameSize: FRAME_SIZE,
  };
};
