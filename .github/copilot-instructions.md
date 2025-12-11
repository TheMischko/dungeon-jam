# GitHub Copilot Context

## Project Description

**Dungeon Jam** is a desktop music player application built with **Electron** and **Angular** (v19) that enables users to:
- Organize and play local music files with full library management
- Stream audio to Discord voice channels via a Discord bot integration
- Capture audio from the application and forward it to connected Discord servers
- Navigate through a tabbed interface supporting future extensibility (e.g., YouTube tabs)

The application combines a powerful Electron backend (handling Discord integration, audio capture, and file management) with a modular Angular frontend (organized into independent projects rendered in a single window).

---

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.8+ (strict mode enabled)
- **Desktop Framework**: Electron 36.3.1
- **Frontend Framework**: Angular 19.2+
- **Build Tool**: esbuild 0.25.5 (for Electron)
- **Package Manager**: npm

### Key Libraries
- **Audio & Discord**: `discord.js` 14.19.3, `@discordjs/voice` 0.18.0, `prism-media` 1.3.5, `opusscript` 0.0.8
- **Audio Playback**: `howler.js` 2.2.4 (frontend music player)
- **Metadata**: `music-metadata` 11.3.0 (extract track information)
- **Database**: `lowdb` 7.0.1 (JSON-based local persistence)
- **UI Components**: Angular Material 19.2.18, Lucide Angular 0.518.0
- **Media Processing**: `ffmpeg-static` 5.2.0
- **Utilities**: RxJS 7.8.0, UUID 11.1.0

### Build & Development
- **Bundling**: esbuild with esbuild-node-externals
- **Frontend Build**: Angular CLI with multi-project support
- **Concurrent Development**: `concurrently` 9.1.2
- **File Operations**: `copyfiles` 2.4.1

### Testing
- Karma 6.4.0 with Jasmine 5.6.0 for Angular projects
- Chrome Launcher for browser testing

---

## Architecture Overview

### High-Level System Design

The application follows a **layered architecture** with clear separation between Electron backend and Angular frontend:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Angular)                 │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │    Main      │   Sidebar    │    Topbar    │             │
│  │  (Music UI)  │ (Navigation) │  (Controls)  │             │
│  └──────────────┴──────────────┴──────────────┘             │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │    General Library (Shared Components)          │        │
│  └─────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
            ↕ IPC + Context Bridge (Preload)
┌──────────────────────────────────────────────────────────────┐
│           Electron Main Process (Backend)                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Manager Layer                       │       │
│  │  ├─ TrackManager     (music library)            │       │
│  │  ├─ FilesManager     (file I/O)                 │       │
│  │  ├─ DiscordManager   (bot & voice)              │       │
│  │  ├─ ViewManager      (window management)        │       │
│  │  ├─ RedirectManager  (routing between views)    │       │
│  │  └─ StoredPlaybackManager (persistence)         │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Services Layer                      │       │
│  │  ├─ Database (lowdb)                            │       │
│  │  ├─ Audio Capture & WebSocket Streaming         │       │
│  │  └─ Track Metadata Extraction                   │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │       Audio Processing Pipeline                 │       │
│  │  └─ WebSocket Server → Opus Encoding →         │       │
│  │     Discord.js Voice Connection                 │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
            ↕ File System & Discord API
┌──────────────────────────────────────────────────────────────┐
│     External Services & Resources                            │
│  ├─ Discord API (voice channels)                            │
│  ├─ Local File System (music library)                       │
│  └─ Environment Variables (.env)                            │
└──────────────────────────────────────────────────────────────┘
```

### Frontend Architecture (Angular Multi-Project Setup)

The `frontend/` folder contains a **monorepo-style Angular workspace** with multiple independent applications:

1. **general** (`projects/general/`)
   - Shared library of reusable components, services, and models
   - Purpose: Common UI elements, utilities, and routing services
   - Consumed by: main, sidebar, topbar projects
   - Output: Compiled library in dist/general

2. **main** (`projects/main/`)
   - Primary music player interface
   - Core responsibilities:
     - Display music library (tracks, albums, playlists)
     - Playback controls (play, pause, seek, volume)
     - Queue management
     - Uses Howler.js for local audio playback
   - Entry point: `src/main.ts` → bootstraps to port 4200 (dev)

3. **sidebar** (`projects/sidebar/`)
   - Navigation and quick settings panel
   - Core responsibilities:
     - Navigation between different app sections
     - Server/channel selection for Discord streaming
     - Quick access toggles and settings
   - Entry point: `src/main.ts` → bootstraps to port 4201 (dev)

4. **topbar** (`projects/topbar/`)
   - Menu bar and tab management
   - Core responsibilities:
     - Application menus and controls
     - Tab system (currently music player, future: YouTube browser, etc.)
     - Window chrome controls
   - Entry point: `src/main.ts` → bootstraps to port 4202 (dev)

All three projects are rendered in a **single Electron window** as separate `WebContentsView` instances, allowing independent development and deployment.

### Backend Architecture (Electron Main Process)

Located in `src/`, organized by responsibility:

**Directory Structure:**
```
src/
├── index.ts                          # Main entry point & app initialization
├── preload.ts                        # Context bridge for IPC APIs
├── main/
│   ├── managers/                     # Business logic layer
│   │   ├── track.manager.ts         # Track CRUD & library operations
│   │   ├── files.manager.ts         # File I/O & path operations
│   │   ├── discord.manager.ts       # Bot connection & voice streaming
│   │   ├── view.manager.ts          # Electron window & view management
│   │   ├── redirect.manager.ts      # IPC routing between frontend views
│   │   ├── stored-playback.manager.ts # User preferences persistence
│   │   └── tabs/                    # Tab configuration & initialization
│   │       ├── base-tab.ts
│   │       ├── frontend.tab.ts      # Angular views loader
│   │       ├── top-bar.tab.ts
│   │       └── side-bar.tab.ts
│   └── database/
│       ├── database.ts              # Singleton DB wrapper (lowdb)
│       └── init-database.ts         # Schema initialization
├── preload/                          # IPC API definitions
│   ├── track-api.ts                 # Track operations API
│   ├── audio-file-api.ts            # File discovery & metadata API
│   ├── playback-api.ts              # Playback control API
│   └── (expose to window via preload.ts)
└── sound-capture/                    # Advanced audio capture
    ├── index.html                   # Web Audio API context
    ├── PCMStream.worklet.js         # Audio worklet for PCM streaming
    ├── preload.ts                   # Specific preload for audio context
    └── capture.ts                   # WebSocket streaming logic
```

---

## Core Architectural Patterns

### 1. IPC (Inter-Process Communication) Layer

**Communication Flow:**
- Frontend → Backend: Angular components call exposed APIs (e.g., `window.TRACK_API.getTracks()`)
- Backend → Frontend: Electron uses `ipcRenderer.send()` to notify views (e.g., track updates)

**Exposed APIs (via Context Bridge in `preload.ts`):**
- `window.GENERAL_API` → Routing & navigation
- `window.TRACK_API` → Track library operations
- `window.AUDIO_FILES_API` → File discovery & metadata
- `window.PLAYBACK_API` → Playback state management

**Key Principle:** Preload scripts (`src/preload/*.ts`) define strict interfaces for IPC—never expose the entire ipcRenderer.

### 2. Manager Pattern (Backend Business Logic)

Each manager encapsulates a specific domain:
- **Singleton instances** created at startup
- Handle all state for their domain (e.g., DiscordManager owns bot connection)
- Expose public methods callable from preload APIs
- Communicate via events or direct method calls

**Example Flow:**
```
Frontend (Angular) 
  → window.TRACK_API.playTrack(trackId) 
  → Preload API 
  → TrackManager.playTrack() 
  → Emit IPC event to frontend for UI update
```

### 3. Database (lowdb Singleton)

- **Single source of truth** for persistent data (tracks, user preferences, playlists)
- Located at `./build/src/db.json`
- Schema defined in `init-database.ts`
- Accessed via `DatabaseWrapper.getInstance()`—all managers use this singleton

**Key Files:**
- `src/main/database/database.ts` → Singleton wrapper
- `src/main/database/init-database.ts` → Schema & defaults

### 4. Audio Capture & Discord Streaming Pipeline

**Advanced architecture for streaming to Discord:**

```
Audio Input (Microphone / System Audio via Web Audio API)
  ↓
WebSocket Server (port 8000, running in Electron)
  ↓
PCM Stream Buffer (received from frontend capture tab)
  ↓
Opus Encoder (prism-media)
  ↓
Discord.js VoiceConnection
  ↓
Discord Voice Channel
```

**Key Components:**
- `src/sound-capture/index.html` → Web Audio context for capture
- `src/sound-capture/PCMStream.worklet.js` → AudioWorklet for low-latency PCM streaming
- `src/index.ts` → WebSocket server initialization & Opus encoding
- `src/sound-capture/capture.ts` → Client-side WebSocket sender

**Audio Specifications:**
- Sample Rate: 48 kHz
- Channels: 2 (stereo)
- Bit Depth: 16-bit
- Frame Duration: 20ms
- Frame Size: 960 bytes per frame

---

## IPC API Reference

### Available Window APIs (Exposed in `src/preload.ts`)

#### GENERAL_API
```typescript
interface GENERAL_API {
  triggerRedirect(path: RedirectPath): void;
  registerRedirect(callback: (path: RedirectPath) => void | Promise<void>): void;
}
```

#### TRACK_API
```typescript
// Access: window.TRACK_API
getTracks(): Promise<Track[]>;
playTrack(trackId: string): Promise<void>;
deleteTrack(trackId: string): Promise<void>;
// See src/preload/track-api.ts for full API
```

#### AUDIO_FILES_API
```typescript
// Access: window.AUDIO_FILES_API
discoverAudioFiles(directory: string): Promise<AudioTrack[]>;
getFileMetadata(filePath: string): Promise<AudioTrack>;
// See src/preload/audio-file-api.ts for full API
```

#### PLAYBACK_API
```typescript
// Access: window.PLAYBACK_API
play(): Promise<void>;
pause(): Promise<void>;
setVolume(volume: number): Promise<void>;
// See src/preload/playback-api.ts for full API
```

---

## Development Workflow

### Local Setup

**Prerequisites:**
- Node.js 18+ 
- npm 9+
- Discord bot token (from Discord Developer Portal)

**Initial Setup:**
```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Create .env file with Discord token
echo 'DISCORD_TOKEN="your_token_here"' > .env

# 3. Start development
npm run start              # Starts Electron (compiles backend + frontend)
# OR in separate terminals:
npm run start:frontend    # Frontend dev servers (ports 4200-4202)
npm run build:electron    # Build Electron backend once
```

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Full dev build: compiles backend, copies files, runs frontend, launches Electron |
| `npm run build:electron` | Compile Electron backend (src/ → build/src/) |
| `npm run build:frontend` | Build all Angular projects for production |
| `npm run compile:dev` | Backend + frontend dev build (no Electron launch) |
| `npm run compile:prod` | Optimized production build with .prod.env |
| `cd frontend && npm run start` | Start Angular dev servers only (for isolated frontend work) |
| `npm run copyfiles:dev` | Copy HTML & JS assets to build folder |

### File Organization Best Practices

**For Backend (src/):**
- Place new managers in `src/main/managers/`
- Register managers in `src/index.ts` during app startup
- Export public APIs via `src/preload/*.ts` files
- Use shared models from `shared/models/` for type safety

**For Frontend (frontend/projects/):**
- Use `general/` library for shared components
- Create component-specific folders: `project/src/app/feature-name/`
- Structure: `component.ts` (smart), `component.component.ts` (presentational), `component.service.ts`
- All IPC calls through injected services (see `RoutingListenerService` pattern)

---

## Key Managers (Backend Business Logic)

### TrackManager
- Manages music library CRUD operations
- Persists to database
- Notifies frontend on library changes
- Location: `src/main/managers/track.manager.ts`

### FilesManager
- Discovers audio files from disk
- Extracts metadata via `music-metadata` library
- Handles file I/O operations
- Location: `src/main/managers/files.manager.ts`

### DiscordManager
- Initializes Discord.js bot
- Manages voice channel connections
- Handles audio streaming via OpusStream
- Location: `src/main/managers/discord.manager.ts`
- **Critical**: Requires DISCORD_TOKEN in .env

### ViewManager
- Creates & manages Electron window
- Manages `WebContentsView` instances for each Angular project
- Handles window lifecycle
- Location: `src/main/managers/view.manager.ts`

### RedirectManager
- Routes IPC navigation events between views
- Enables sidebar → main navigation, etc.
- Uses `GeneralChannels.REDIRECT` IPC channel
- Location: `src/main/managers/redirect.manager.ts`

### StoredPlaybackManager
- Persists playback state (volume, position, etc.)
- Restores state on app restart
- Location: `src/main/managers/stored-playback.manager.ts`

---

## Data Models (Shared Types)

Located in `shared/models/`:

- **Track**: `{ id, name, url, author?, duration }`
- **AudioTrack**: `{ title, fullPath, author?, length }`
- **FileBase64**: `{ base64, mimeType }` (for file transfer)
- **StoredPlayback**: `{ volume }`
- **Channels**: IPC channel names (RedirectPath, etc.)

---

## Environment Configuration

**Development (.env):**
```env
DISCORD_TOKEN="your_development_bot_token"
ENV="development"
```

**Production (.prod.env):**
```env
DISCORD_TOKEN="your_production_bot_token"
ENV="production"
```

Environment is loaded via `dotenv` in `src/index.ts` at startup.

---

## Build Output Structure

After `npm run compile:dev`:

```
build/src/
├── index.js                  # Compiled Electron main process
├── preload.js               # Compiled preload script
├── db.json                  # Database file
└── sound-capture/
    ├── index.html           # Audio capture web page
    ├── PCMStream.worklet.js # Copied worklet file
    └── preload.js           # Audio capture preload
```

Frontend builds go to `frontend/dist/`:
```
dist/
├── main/                    # Main project build
├── sidebar/                 # Sidebar project build
└── topbar/                  # Topbar project build
```

---

## Guidelines for AI Code Generation

### Manager Initialization Flow

The application uses a centralized `StartupManager` to initialize all managers in dependency order during app startup:

**Files Involved:**
- `src/main/managers/startup.manager.ts` - Orchestrates manager initialization
- `src/main/configs/managers.config.ts` - Defines initialization order and dependencies
- `src/main/configs/audio.config.ts` - Audio pipeline configuration

**When Adding a New Manager:**

1. **Create the Manager Class**
   ```typescript
   // src/main/managers/your-feature.manager.ts
   export class YourFeatureManager {
     private static instance: YourFeatureManager;
     
     private constructor(/* dependencies */) {}
     
     public static async getInstance(): Promise<YourFeatureManager> {
       if (!YourFeatureManager.instance) {
         // Initialize dependencies first
         const depManager = await DependencyManager.getInstance();
         YourFeatureManager.instance = new YourFeatureManager(depManager);
         YourFeatureManager.instance.registerChannels();
       }
       return YourFeatureManager.instance;
     }
     
     private registerChannels(): void {
       // Register IPC handlers
     }
   }
   ```

2. **Register in `src/main/configs/managers.config.ts`**
   - Add import for your new manager
   - Add initialization entry in the appropriate phase:
     - **Phase 1**: Core infrastructure (no dependencies) - e.g., StoredPlayback, View
     - **Phase 2**: Data managers (database only) - e.g., Tags, Files
     - **Phase 3**: Cross-dependent managers - e.g., Track (depends on Files & Tags)
     - **Phase 4**: Feature managers (depend on data) - e.g., Playlist, Redirect
     - **Phase 5**: Advanced managers (depend on multiple) - e.g., Discord, PlaybackDestination

   ```typescript
   // In getManagersInitConfig() function
   {
     name: 'YourFeature',
     initFunction: async () => {
       await YourFeatureManager.getInstance();
     },
   },
   ```

3. **Define IPC Channel** (if exposing to frontend)
   ```typescript
   // In src/shared/models/channels.model.ts
   export enum YourFeatureChannel {
     DO_SOMETHING = 'YOUR_FEATURE:DO_SOMETHING',
   }
   ```

4. **Export Public API** (if needed by frontend)
   ```typescript
   // src/preload/your-feature-api.ts
   export const YOUR_FEATURE_API = {
     doSomething: () => ipcRenderer.invoke(YourFeatureChannel.DO_SOMETHING),
   };
   ```

**Key Principles:**
- Managers are singletons initialized on app startup via `StartupManager`
- All manager IPC handlers are registered during `getInstance()` 
- Dependencies must be explicitly listed in the config (phase ordering)
- Async/await pattern ensures proper initialization sequencing
- Frontend can safely call APIs after all managers initialize

### When Adding New Features

1. **Feature Spans Frontend & Backend?**
   - Create new manager in `src/main/managers/feature.manager.ts`
   - Register in `src/main/configs/managers.config.ts` (see Manager Initialization Flow above)
   - Export public API in new `src/preload/feature-api.ts`
   - Create Angular service in `frontend/projects/general/services/` that calls the API
   - Use the service in components via dependency injection

2. **Frontend-Only Changes**
   - Add components/services directly to appropriate Angular project
   - Keep shared logic in `general/` library
   - Never duplicate code across main/sidebar/topbar

3. **Audio/Discord-Related Changes**
   - Modify `DiscordManager` for bot behavior
   - Modify `StartupManager.initializeResources()` for audio pipeline changes
   - Update `src/main/configs/audio.config.ts` for audio spec changes
   - Ensure audio specs (48kHz, 16-bit, stereo) are maintained

4. **Database Schema Changes**
   - Update `src/main/database/init-database.ts`
   - Add accessor method in `DatabaseWrapper`
   - Update affected manager to use new schema

### Code Quality Standards

- **TypeScript**: Strict mode enforced; use interfaces for all IPC data
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **IPC Safety**: Never expose internal implementation; always define clear API boundaries
- **Error Handling**: Catch errors in managers, log via console, return to frontend gracefully
- **Comments**: Add JSDoc comments for public manager methods and complex audio logic

### Architecture Constraints

⚠️ **Critical Rules:**
- Never call Electron APIs directly from Angular frontend—use IPC
- Audio worklet (`PCMStream.worklet.js`) must remain in sync with main process Opus encoding specs
- Discord token must never be hardcoded; always load from .env
- Database operations should be atomic; avoid partial writes

### Documentation Output Guidelines

**DO NOT generate explanation or documentation files** when implementing features or fixes. This includes:
- ❌ Summary documents explaining what was done
- ❌ Implementation guides or walkthroughs
- ❌ Quick reference cards
- ❌ Troubleshooting guides for new features
- ❌ Verification checklists
- ❌ Any `.md` files documenting your changes

**ONLY create files if explicitly requested by the user.** Focus on code implementation only. Users will ask for documentation if they want it.

---

## Related Resources

- **Electron Documentation**: Context bridge, IPC, WebContentsView
- **Angular Documentation**: Multi-project workspaces, services, dependency injection
- **Discord.js**: Voice connections, streaming, bot initialization
- **Web Audio API**: AudioContext, AudioWorklet, PCM encoding
- **Howler.js**: Audio playback library used in main project
