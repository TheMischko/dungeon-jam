# Agent Instructions & Guidelines

Welcome to the **Dungeon Jam** codebase. This document outlines project architecture, essential commands, and development conventions for AI agents and contributors.

---

## 1. Project Architecture

* **Frontend**: Angular 18+ (multi-project workspace in `frontend/projects/`: `main`, `sidebar`, `topbar`, `general`).
* **Backend (Electron Main)**: Located in `src/main/` managing LowDB, IPC communication, audio file metadata (`music-metadata`), audio capture (`src/sound-capture/`), and Discord voice integration (`@discordjs/voice`).
* **Audio Playback**: Handled in renderer via Howler.js (`AudioPlayerService` / `HowlTrack`) running HTML5 Audio and Web Audio API.
* **Testing Stack**:
  * Unit/Integration: Vitest for Electron main (`npm run test:electron`), Vitest/Karma for frontend (`npm run test:frontend`).
  * End-to-End (E2E): Playwright + Cucumber (`cucumber-tsflow`) located in `tests/`.

---

## 2. E2E Testing & Test Index

The project maintains a dedicated catalog of all End-to-End tests in:
👉 **[`tests/E2E_INDEX.md`](./tests/E2E_INDEX.md)**

### Mandatory Rule for Agents:
> **Whenever you add, modify, or delete E2E tests or `.feature` files, you MUST update [`tests/E2E_INDEX.md`](./tests/E2E_INDEX.md) to reflect the new scenarios, tags, and descriptions.**

### Running E2E Tests:
```bash
# Run all E2E tests
npm run test:e2e

# Run with tag filters
npm run test:e2e -- --tags "@playback"
npm run test:e2e -- --tags "@player-controls"
npm run test:e2e -- --tags "@switching"
npm run test:e2e -- --tags "@playlists"
npm run test:e2e -- --tags "@library"
npm run test:e2e -- --tags "@sidebar"
```

### E2E Architecture Guidelines:
1. **Gherkin Features (`tests/features/`)**: High-level behavioral specs. Categorize by domain (e.g. `main/`, `sidebar/`).
2. **Page Objects (`tests/pages/`)**: Encapsulate element interactions; inherit from `BaseMainPage` or `BaseSidebarPage`.
3. **Selectors (`tests/selectors/`)**: Maintain selectors in dedicated selector classes; avoid hardcoding CSS strings directly in steps.
4. **Step Definitions (`tests/steps/`)**: Use `cucumber-tsflow` with `@binding([TestContext])`.
5. **Audibility Testing**: Use [`tests/utils/audio-playback-inspector.ts`](./tests/utils/audio-playback-inspector.ts) (`measureAudioOutput`) to inspect RMS levels directly from Howler and Web Audio stream nodes.

---

## 3. Useful Commands

```bash
# Build & Compilation
npm run build:electron:dev      # Build Electron main process in dev mode
npm run build:frontend          # Build Angular frontend
npm run compile:dev             # Build both Electron and Angular

# Running the App
npm run start                   # Start the application

# Tests
npm run test                    # Run unit tests (Electron + Frontend)
npm run test:e2e                # Run E2E tests via Cucumber + Playwright
```
