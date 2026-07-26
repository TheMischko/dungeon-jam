# Browser Tabs Feature — Design & Implementation Plan

## 1. Feature Overview

Turn the app's topbar into a real browser-style tab strip with a URL box. The existing Angular
music player becomes a **pinned, non-closable "Home" tab** living in the same tab strip as
real, navigable web pages (e.g. YouTube, a soundboard site, etc.). Every open tab — the player and
every web page — keeps playing in the background, and **all of their audio is mixed together**
into the single stream that already gets sent to Discord.

This is a natural extension of the existing architecture, not a new concept: the app already
captures audio from a specific `WebContentsView` using Chromium tab-capture
(`webContents.getMediaSourceId()` + `chromeMediaSource: 'tab'`, see
[startup.manager.ts](../src/main/managers/startup.manager.ts) and
[capture.ts](../src/sound-capture/capture.ts)), and `frontend.tab.ts` even has a commented-out
prototype of adding a second `WebContentsView` that loads `youtube.com`. This feature generalizes
that existing single-tab capture into a dynamic, many-source audio mixer.

---

## 2. Design Decisions

| Topic | Decision |
|-------|----------|
| Player vs. browser tabs | The Angular player is a pinned, non-closable tab inside the **same** tab strip as real browser tabs (not a separate mode/toggle). |
| Background tabs | All opened tabs (player + web pages) stay fully alive and rendering even when not visible — required so a background tab's audio keeps streaming to Discord while another tab is focused. |
| Audio mixing | Done via Web Audio in the **existing single `sound-capture` `WebContentsView`**: one shared `AudioContext`/mixer `GainNode`. Each tab (player included) gets its own `getUserMedia` tab-capture call; the resulting `MediaStreamAudioSourceNode` connects into the shared mixer node feeding the existing worklet/encoder pipeline. Tabs opening/closing just attach/detach a node — no change to the WebSocket/Opus/Discord half of the pipeline. Rejected alternative: giving every tab its own capture context + WebSocket and summing raw PCM in the Node backend (more moving parts, manual clipping/sync handling). |
| Per-tab / global volume | None. Sites manage their own volume (YouTube's own volume slider, etc.); the app's existing player volume is untouched. Everything is mixed as-is with no additional gain UI. |
| URL box | Strict URL only (must type a full `https://...`); no omnibox/search-query detection. New tabs open blank. |
| Session/cookies | Browser tabs use a **persistent** Electron session partition (`persist:browser-tabs`) so logins/cookies survive app restarts. Low implementation cost (just a named partition). |
| Popups / `target="_blank"` | Intercepted via `setWindowOpenHandler` and opened as a new tab in the same strip (not a native OS window, not denied). |
| Site permissions | Auto-allow only `media` (autoplay — required for background audio to work at all); deny camera, microphone, notifications, geolocation by default. |
| Tab count | Soft cap of **5** concurrent browser tabs (excludes the pinned player tab). UI blocks/warns past the cap. |
| Restart behavior | Tabs are **not** restored on relaunch — app always starts with only the pinned player tab open. |
| Topbar layout | Topbar grows taller into two rows: (1) window controls + tab strip, (2) back/forward/reload + URL box. Exact sizing to be tuned visually during implementation. |
| URL row visibility | Hidden/disabled while the pinned player tab is active (no URL to show). |
| Security (non-negotiable) | Browser tabs get **no preload script and no contextBridge exposure** — `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, isolated `persist:browser-tabs` session. They must never be able to reach the app's privileged IPC APIs (`TRACK_API`, `DISCORD_API`, etc.), since they render arbitrary, untrusted third-party content. |

---

## 3. Architecture Overview

```
Topbar (Angular)                     Main content area                Sound Capture (hidden WebContentsView)
┌───────────────────────┐            ┌───────────────────────┐        ┌─────────────────────────────────┐
│ [Home] [yt.com] [+]    │            │  active tab's          │        │  Shared AudioContext             │
│ ← → ⟳  [ URL box    ]  │  switch →  │  WebContentsView is    │        │   mixerGain (existing            │
└───────────────────────┘  navigate → │  shown in this rect;   │        │   audioOutputNode)               │
        │  IPC                       │  others parked          │        │     ├─ tap: player tab          │
        ▼                            │  off-screen but alive   │        │     ├─ tap: browser tab #1      │
BrowserTabManager (main proc)         └───────────────────────┘        │     ├─ tap: browser tab #2      │
  - Map<tabId, WebContentsView>                                       │     └─ ...                       │
  - active tab id                                                     │   → AudioWorkletNode (existing)  │
  - create / close / navigate / switch                                │   → WebSocket → Opus → Discord   │
  - getMediaSourceId(tab) → tells                                     │        (existing pipeline,        │
    capture tab to add/remove a tap  ───────────────────────────────► │         unchanged)                │
```

Each tab's `WebContentsView` is added once to `appWindow.contentView` and never destroyed while
open. Switching tabs only changes **bounds** (active tab gets the real content rect from
`getMainTabRect`; inactive tabs are moved off-screen / collapsed) — it does not reload or recapture
audio, since Chromium's background-tab throttling behaves the same way a real browser does.

---

## 4. Proposed Data Model

New file `shared/models/browser-tab.model.ts`:

```typescript
export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  faviconUrl?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export enum BrowserTabChannel {
  CREATE = 'BROWSER_TAB:CREATE',
  CLOSE = 'BROWSER_TAB:CLOSE',
  SWITCH = 'BROWSER_TAB:SWITCH',
  NAVIGATE = 'BROWSER_TAB:NAVIGATE',
  GO_BACK = 'BROWSER_TAB:GO_BACK',
  GO_FORWARD = 'BROWSER_TAB:GO_FORWARD',
  RELOAD = 'BROWSER_TAB:RELOAD',
  LIST_UPDATED = 'BROWSER_TAB:LIST_UPDATED',   // pushed to topbar
  ACTIVE_CHANGED = 'BROWSER_TAB:ACTIVE_CHANGED', // pushed to topbar
}
```

The pinned player tab can be represented as a synthetic `BrowserTab` with a reserved id (e.g.
`'player'`) that the UI renders specially (no close button, no URL row) — this keeps the tab list a
single unified array as decided above.

---

## 5. Implementation Steps

### Phase A — Backend: tab lifecycle (Manager layer)
1. Add `BrowserTabManager` (`src/main/managers/browser-tab.manager.ts`) following the existing
   singleton Manager pattern (see `getInstance`/`registerChannels` convention already used by other
   managers, e.g. `track.manager.ts`).
   - Holds `Map<tabId, WebContentsView>`, active tab id, enforces the 5-tab soft cap.
   - `createTab(url)`: builds a `WebContentsView` with `session: session.fromPartition('persist:browser-tabs')`,
     `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, **no preload**.
   - Wires `did-start-loading` / `did-stop-loading` / `page-title-updated` / `page-favicon-updated` /
     `did-navigate` listeners to keep `BrowserTab` state current and push `LIST_UPDATED` events.
   - Wires `setWindowOpenHandler` → creates a new managed tab, returns `{ action: 'deny' }`.
   - Wires the session's `setPermissionRequestHandler` (once, on the partition) → allow only `media`.
   - `switchTab(id)`: applies `getMainTabRect` bounds to the new active view, parks the previous one
     off-screen (e.g. zero-size or negative-offset bounds) without destroying it.
   - `closeTab(id)`: removes the view from `contentView`, destroys it, tells the capture tab to drop
     its audio tap.
2. Register `BrowserTabManager` in `src/main/configs/managers.config.ts` (needs `ViewManager`, so
   place it in the same phase as/after `View`).
3. Extend `ViewManager` so `getMainTabRect`-sized bounds updates and the "list of things that can be
   the visible main-content view" include the currently active browser tab, not just `frontendTab`.

### Phase B — Backend: dynamic multi-source audio capture
1. Extend `src/sound-capture/capture.ts` to support **multiple concurrent taps** instead of the one
   fixed `getUserMedia` call it does today:
   - Keep the existing shared `AudioContext` / `audioOutputNode` (mixer) / worklet / WebSocket exactly
     as-is.
   - Add a `Map<tabId, { stream: MediaStream; sourceNode: MediaStreamAudioSourceNode }>`.
   - New message handled from main process: `ADD_CAPTURE_SOURCE { tabId, chromeMediaSourceId }` →
     `getUserMedia` with those constraints → `createMediaStreamSource(stream).connect(audioOutputNode)`.
   - New message: `REMOVE_CAPTURE_SOURCE { tabId }` → stop stream tracks, disconnect node, remove from map.
2. Extend `src/sound-capture/preload.ts` to expose these two new bridge calls (alongside the existing
   `setupAudioCapture`), still scoped only to the capture tab's own preload (unrelated to the
   isolation requirement for browser tabs above — the capture tab is trusted app code).
3. Update `StartupManager`/`BrowserTabManager` so that every time a tab (player or browser) is
   created, it calls `webContents.getMediaSourceId(captureTab.webContents)` and sends
   `ADD_CAPTURE_SOURCE`; on tab close, sends `REMOVE_CAPTURE_SOURCE`. The player tab's existing
   one-shot `setupAudioCapture` call in `startup.manager.ts` becomes just the first call into this
   same generalized add/remove path.

### Phase C — Preload/IPC surface for the frontend
1. Add `src/preload/browser-tab-api.ts` exposing `window.BROWSER_TAB_API`: `createTab(url)`,
   `closeTab(id)`, `switchTab(id)`, `navigate(id, url)`, `goBack(id)`, `goForward(id)`, `reload(id)`,
   `onTabsUpdated(cb)`, `onActiveTabChanged(cb)` — mirrors the existing `track-api.ts` style.
2. Wire it into `src/preload.ts` alongside the other exposed APIs.

### Phase D — Frontend: topbar UI
1. New Angular components in `frontend/projects/topbar/src/app/`:
   - `tab-strip` — renders the tab list (favicon, title, close button, "+" new-tab button), the
     player tab rendered specially (pinned, no close button).
   - `nav-bar` — back/forward/reload buttons + URL input; hidden when the player tab is active.
2. New signal-based service in `frontend/projects/general` (per repo convention: prefer signals over
   observables) wrapping `window.BROWSER_TAB_API`, exposing `tabs`, `activeTabId` signals and action
   methods.
3. Update topbar layout/height (`tab-config.ts` `TOPBAR_HEIGHT_PX` and topbar's own SCSS) to fit the
   two-row browser-chrome layout; adjust `getSideBarRect`/`getMainTabRect` accordingly since they all
   derive from `TOPBAR_HEIGHT_PX`.
4. Add tab-cap UI feedback (disable "+" / show a message once 5 browser tabs are open).

### Phase E — Polish & edge cases
1. Handle capture-tap failures gracefully (e.g. a tab closed mid capture-setup) — log via existing
   `Logger`, don't crash the mixer.
2. Confirm Discord audio quality with multiple simultaneous sources (mixer headroom — consider
   whether the shared `audioOutputNode` needs a limiter/compressor so multiple loud tabs don't clip
   when summed; not needed for a single source today).
3. Manual test matrix: open player + 2 tabs playing audio simultaneously → verify Discord hears all
   three mixed; close a background tab mid-playback → verify its tap is removed cleanly; hit the
   5-tab cap; reload the app → verify only the player tab exists (no restore).

---

## 6. Effort Signal (rough, not a time estimate)

| Phase | Scope | Relative size |
|-------|-------|----------------|
| A | New manager, view lifecycle, bounds/visibility handling | Large |
| B | Multi-source capture/mixer changes | Medium (isolated, existing pipeline mostly untouched) |
| C | Preload/IPC plumbing | Small |
| D | Topbar UI (tab strip, nav bar, layout rework) | Large |
| E | Polish/edge cases/testing | Medium |

Phases A and B can be built and manually verified (e.g. via temporary dev-tools buttons) before any
frontend UI exists, since they only depend on IPC calls, not the topbar UI.

---

## 7. Open Risks / Things to Revisit During Implementation

- Exact off-screen/park technique for inactive `WebContentsView`s (zero-size bounds vs. negative
  offset) — needs a quick spike to confirm Chromium still throttles-but-doesn't-suspend audio in
  both cases.
- Whether a limiter/compressor is needed on the shared mixer `GainNode` once multiple loud sources
  are summed simultaneously (clipping risk).
- Final topbar pixel heights for the two-row layout — decide visually once the tab strip + nav bar
  are in place.
- Favicon fetching/caching strategy (Electron exposes `page-favicon-updated` with a URL list; decide
  whether to just bind `<img>` directly or download/cache).
