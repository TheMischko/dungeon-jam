# DungeonJam Backend - Electron application
## Application overview
The purpose of DungeonJam is to provide reliable self-hosted service, which can stream locally stored music to a Discord channel.
DungeonJam is an JavaScript (or rather TypeScript project) combining standard FrontEnd + BackEnd structure.
The backend is the body of the application. Library Electron bundles the Frontend into a self-contained application offering the web-like interface. The Electron backend serves as director of the communication, and a single source of truth holding all the data in a database.
The frontend is then a face of the application, and is being developed with Angular. The frontend is split into three separate "windows" positioned into the main application window in way that mimics having an application with a sidebar, topbar, and main content. All those views are separate Angular applications.

## Sound streaming
The main magic behind the sound stream is the `sound-capture` window. This window operates on top of the three frontend windows, which enables it to capture audio from those views.
The Sound Capture window is parsing the recorded stream and performs som magic on top of it, to make it streamable via the `PCMStream.worklet.js`.
The output of this is linked to a web socket client. The server is hosted inside the Electron backend, so the data from Sound Capture goes directly to Backend on the web socket line.
There the backend builds a stream and pipes it to the `Discord.js` API.

---
## Enhanced Sound Capture Architecture (Electron Backend)
You WILL use this section as the authoritative map of the audio capture → encode → Discord streaming pipeline.

### 1. High-Level Flow
```
[Angular Tabs: main/sidebar/topbar] (play local audio via Howler.js)
   ↓ (Rendered in same BrowserWindow as separate WebContentsView instances)
[Capture Tab (sound-capture/index.html + preload)] overlays other tabs
   ↓ (Chromium tab capture: mediaDevices.getUserMedia with chromeMediaSourceId)
[Web Audio API Graph]
   MediaStreamSource → Gain(output) → Gain(audioOutputNode) → AudioWorkletNode(PCMStream)
   ↓ (PCM int16 stereo frames @ 48kHz, 20ms / 960 samples)
[AudioWorkletNode port messages]
   ↓
[WebSocket Client (sound-capture/capture.ts)] --> ws://localhost:17253
   ↓ (Raw Int16Array frame payloads)
[WebSocket Server (index.ts)]
   ↓ (Buffer writes) 
[Opus Encoder (prism-media opus.Encoder)]
   ↓ (Opus packets as Readable stream)
[DiscordManager.startStreaming()] → @discordjs/voice AudioPlayer
   ↓
[Discord Voice Channel]
```

### 2. Directory & File Responsibilities
- `src/index.ts`
  - Application bootstrap (Electron app ready handler)
  - Defines audio constants (SAMPLE_RATE=48000, NUM_CHANNELS=2, BIT_DEPTH=16, FRAME_DURATION=20ms, FRAME_SIZE=960)
  - Starts WebSocket server on port 17253 (`setupWebsocketServer`) and exposes address over IPC (`ipcMain.handle('get-websocket')`)
  - Instantiates `opus.Encoder` (prism-media) and writes raw PCM buffers into it (each WebSocket message → `encoder.write(buffer)`)
  - Initializes managers (ViewManager, DiscordManager, TrackManager, etc.) then connects Discord and joins first available voice channel passing encoder Readable stream.
- `src/main/managers/view.manager.ts`
  - Creates main BrowserWindow plus four views:
    - Capture tab (overlays others) with its own preload: `sound-capture/preload.js`
    - Frontend tabs: main, topbar, sidebar (Angular apps)
  - Maintains resize broadcast and IPC convenience.
  - Critical: capture tab is loaded with `indexHTML` (compiled/copy of `sound-capture/index.html`).
- `src/sound-capture/index.html`
  - Minimal HTML scaffold; loads `capture.js` (compiled from `capture.ts`) and a button enabling local loopback.
- `src/sound-capture/preload.ts`
  - Secure IPC bridge for the capture view only.
  - Exposes `window.API.setupAudioCapture(callback)` → receives constraints from main process (sent after `getMediaSourceId`).
  - Exposes `window.API.getWebSocketAddress()` → obtains port of WebSocket server.
- `src/sound-capture/capture.ts`
  - Requests Chromium tab audio via `navigator.mediaDevices.getUserMedia` using injected constraints.
  - Builds Web Audio graph; registers AudioWorklet module `PCMStream.worklet.js`.
  - Creates `AudioWorkletNode` named `pcm-stream` with `parameterData.bufferSize = FRAME_SIZE`.
  - Receives Int16 ring buffer frames from worklet (`pcmStreamNode.port.onmessage`) and forwards them immediately over WebSocket.
  - Optional local loopback (`Start local loopback` button) creates a local playback element to audibly monitor streaming path.
- `src/sound-capture/PCMStream.worklet.js`
  - AudioWorkletProcessor implementation.
  - Interleaves stereo Float32 input → converts to Int16 → accumulates into ring buffer of size FRAME_SIZE.
  - Posts entire Int16Array to main thread once pointer wraps (one 20ms frame worth of interleaved samples).
- `src/main/managers/discord.manager.ts`
  - Manages Discord connection, voice channel join, creation of AudioPlayer.
  - `startStreaming(stream: Readable)` accepts Opus packet stream produced by `opus.Encoder` in `index.ts`.

### 3. Detailed Capture → Discord Sequence
1. Electron `app.ready` triggers initialization inside `index.ts`.
2. ViewManager creates capture tab and Angular tabs; obtains `sourceId` via `youtubeTab.webContents.getMediaSourceId(captureTab.webContents)` in `setupAudioCapture`.
3. Main process sends IPC event `setup-audio-capture` with `{ chromeMediaSource: 'tab', chromeMediaSourceId: sourceId }` into capture tab.
4. Capture tab preload listens and resolves constraints; `capture.ts` calls `getUserMedia` with those constraints (audio only).
5. Web Audio graph processes frames; AudioWorklet converts them to Int16 PCM in fixed-size (FRAME_SIZE=960) ring buffer.
6. Each completed ring buffer postMessage emits one Int16Array (stereo interleaved 16-bit samples for 20ms).
7. Capture script sends Int16Array raw bytes over WebSocket to backend server.
8. Backend receives message; converts to Buffer; writes into `Encoder` (prism-media opus.Encoder configured with same channels, frame size, sample rate).
9. Encoder outputs Opus packets through its Readable interface.
10. `DiscordManager.joinChannel(..., encoder)` subscribes AudioPlayer to voice connection, plays newly created AudioResource with Opus input type.
11. Discord clients in channel hear audio representing aggregated playback from Angular tabs.

### 4. Critical Synchronization Points
You WILL maintain consistency across these constants in BOTH `index.ts` and `capture.ts`:
- SAMPLE_RATE (48_000 Hz)
- NUM_CHANNELS (2 for stereo)
- FRAME_DURATION (20 ms) → frame size MUST remain 960 samples per channel (per Opus standard for 48kHz / 20ms stereo @ 16-bit PCM)
- TOTAL_INTERLEAVED_SAMPLES_PER_FRAME = 1920 (960 per channel × 2 channels)
- **FRAME_SIZE_BYTES = TOTAL_INTERLEAVED_SAMPLES_PER_FRAME × BYTES_PER_SAMPLE = 1920 × 2 = 3840 bytes**

## Quick Reference Constants
| Name | Value | Location(s) |
|------|-------|-------------|
| SAMPLE_RATE | 48000 | `index.ts`, `capture.ts` |
| NUM_CHANNELS | 2 | `index.ts`, `capture.ts` |
| BIT_DEPTH | 16 | `index.ts`, `capture.ts` |
| FRAME_DURATION | 20ms | `index.ts`, `capture.ts` |
| FRAME_SIZE | 960 (samples or Int16 values) | Derived; both files |

---
## Security Notes
You WILL NOT expose raw Discord tokens to renderer processes. `.env` is loaded only in main via `dotenv` (`index.ts`). Ensure any new preload script mirrors the minimal API surface pattern used in `sound-capture/preload.ts`.

---
## Contribution Style for Audio Features
You WILL provide:
- Clear commit messages referencing this README section.
- Added/updated inline JSDoc for new DSP nodes.
- Unit/integration tests for frame integrity when feasible.

---
## Summary
This README now serves as the operational contract for the sound capture pipeline. Maintain synchronization of constants, respect IPC boundaries, and preserve performance characteristics when extending functionality.
