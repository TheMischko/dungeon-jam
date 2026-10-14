# E2E Test Suite Index

This document provides a catalog of all End-to-End (E2E) tests in **Dungeon Jam**, built using **Playwright**, **Cucumber (Gherkin)**, and **cucumber-tsflow**.

> **Note for Developers & AI Agents:**  
> When creating, modifying, or removing E2E tests, **always update this index** so the catalog and documentation remain accurate and comprehensive.

---

## Quick Execution Reference

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests filtered by tags:
```bash
# Playback & audio tests
npm run test:e2e -- --tags "@playback"

# Player controls (play, pause, next, prev)
npm run test:e2e -- --tags "@player-controls"

# Player volume & mute
npm run test:e2e -- --tags "@volume"

# Playlist switching on landing page
npm run test:e2e -- --tags "@switching"

# All playlist-related scenarios
npm run test:e2e -- --tags "@playlists"

# Library scenarios
npm run test:e2e -- --tags "@library"

# Library search
npm run test:e2e -- --tags "@search"

# Sound effects
npm run test:e2e -- --tags "@sound-effects"

# Auto Update & New Version Available modal
npm run test:e2e -- --tags "@updates"

# Sidebar navigation
npm run test:e2e -- --tags "@sidebar"
```

---

## Test Scenarios Catalog

| Feature File | Tags | Scenarios Summary | Key Focus |
|---|---|---|---|
| [`tests/features/main/playback-audio.feature`](./features/main/playback-audio.feature) | `@playlists`<br>`@playback`<br>`@audio` | 1. **Application emits audible sound when playback is started**<br>2. **Application emits silence when playback is not active** | Verifies true audible output (RMS > 0.01) via Web Audio API analysis, and ensures silence when idle. |
| [`tests/features/main/playback-playlist-switching.feature`](./features/main/playback-playlist-switching.feature) | `@playlists`<br>`@playback`<br>`@audio`<br>`@switching` | 1. **Switching between two playlists plays audio for each playlist** | Tests hovering over playlist cards on the Playlists landing page, starting playback, and switching between playlists with active track verification. |
| [`tests/features/main/playback-player-controls.feature`](./features/main/playback-player-controls.feature) | `@playlists`<br>`@playback`<br>`@audio`<br>`@player-controls` | 1. **User can pause, resume, and skip between tracks in bottom player** | Verifies bottom player controls: pause (silence), resume (audible), next track (skip forward), previous track (skip backward). |
| [`tests/features/main/playback-player-volume.feature`](./features/main/playback-player-volume.feature) | `@playlists`<br>`@playback`<br>`@audio`<br>`@volume` | 1. **User can adjust playback volume and mute audio using volume slider** | Verifies volume slider adjustment, muting to 0 (silence + muted icon), restoring volume (audible + unmuted icon). |
| [`tests/features/main/playback-sound-effects.feature`](./features/main/playback-sound-effects.feature) | `@sound-effects`<br>`@playback`<br>`@audio` | 1. **User can play, inspect pill, and stop a sound effect from library**<br>2. **Sound effect plays concurrently with music playlist playback** | Tests individual and concurrent sound effect playback, player bar pill lifecycle, and independent audio mix. |
| [`tests/features/main/library-search-playback.feature`](./features/main/library-search-playback.feature) | `@library`<br>`@playback`<br>`@audio`<br>`@search` | 1. **User can filter tracks in library using search**<br>2. **User can play tracks directly from library table** | Tests library search bar filtering, zero-results state, search reset, and direct track playback with audibility check. |
| [`tests/features/main/create-playlist.feature`](./features/main/create-playlist.feature) | `@playlists` | 1. **User creates a new playlist through the modal** | Playlist creation modal, form inputs, validation, and appearance on the landing page grid. |
| [`tests/features/main/playlist-tracks.feature`](./features/main/playlist-tracks.feature) | `@playlists`<br>`@library` | 1. **User adds library tracks to a playlist via the add tracks modal** | Multi-track selection modal, assigning tracks to a playlist, and table display. |
| [`tests/features/main/library-upload.feature`](./features/main/library-upload.feature) | `@library` | 1. **User uploads audio files via drag & drop** | Drag & drop file ingestion using CDP sessions, multi-step metadata upload wizard, and library listing. |
| [`tests/features/main/auto-update.feature`](./features/main/auto-update.feature) | `@updates`<br>`@settings` | 1. **User skips an update and the modal does not reappear on reload or restart**<br>2. **User installs an update and modal does not appear after restarting into the new version**<br>3. **A newer version becomes available after user skipped a previous version**<br>4. **Application is up to date and does not display update modal**<br>5. **Modal does not unexpectedly reopen while navigating through application**<br>6. **User manually checks for updates in settings when application is up to date**<br>7. **User manually checks for updates in settings when a new update is available** | Verifies update notification modal lifecycle, skip persistence, upgrade workflow, manual check from settings, and toast notifications. |
| [`tests/features/sidebar/sidebar-navigation.feature`](./features/sidebar/sidebar-navigation.feature) | `@sidebar` | 1. **User navigates through the sidebar menu** | Navigation between views (`Playlists`, `Library`, `Tags`, `Sound Effects`). |

---

## Test Architecture & Conventions

* **Features (`tests/features/`)**: Gherkin specifications categorized by domain (`main`, `sidebar`).
* **Page Objects (`tests/pages/`)**: Encapsulate UI interactions; extend `BaseMainPage` or `BaseSidebarPage`.
* **Selectors (`tests/selectors/`)**: Static selector constants categorized by domain. Keep selectors decoupled from step definitions.
* **Steps (`tests/steps/`)**: TypeScript classes decorated with `@binding([TestContext])` from `cucumber-tsflow`.
* **Data Preparation (`tests/steps/main/data-preparation.steps.ts`)**: Direct database / IPC helpers for seeding fixtures (`tests/fixtures/sounds/`) without unnecessary UI friction.
* **Audio Audibility Inspection (`tests/utils/audio-playback-inspector.ts`)**: Injects into Chromium renderer via Playwright `evaluate()` to measure Root Mean Square (RMS) signal from Howler HTML5 `<audio>` elements (`captureStream()`) and Web Audio API nodes. Ensures deterministic audio testing in CI without physical audio hardware.
* **Mock Update Server (`tests/utils/mock-update-server.ts`)**: In-memory ephemeral HTTP server simulating `electron-updater` generic releases (`latest.yml`) for deterministic and offline auto-update testing.
