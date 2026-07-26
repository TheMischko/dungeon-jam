# Media Keys & Arrow Seek/Skip — Notes

## 1. Media Keys (Play/Pause, Next, Prev)

### What are they
- Hardware media keys, or Fn-combos (e.g. `Fn+F9`).
- Send special HID "Consumer Control" codes.
- Different from normal keypresses.

### Fn key — important limitation
- Fn is invisible to software.
- Swallowed by keyboard firmware, before OS sees it.
- No way to detect "Fn was held."
- Firmware either:
  - emits a real media-key code, or
  - emits a plain key (e.g. just `F9`).
- Depends on hardware/vendor/OS Fn-lock setting.
- Not something we can control or guarantee.

### Chosen capture mechanism: Electron `globalShortcut` only

- Decision: capture media keys **only** via Electron's `globalShortcut`, in the main process.
- No renderer-side `navigator.mediaSession` — dropped to keep a single source of truth.
- Accelerators to register: `MediaNextTrack`, `MediaPreviousTrack`, `MediaPlayPause`, `MediaStop`.
- System-wide.
  - Works even when app is unfocused/backgrounded.
  - This is the actual expected behavior of hardware media keys.
- Must call `globalShortcut.unregisterAll()` on quit.
  - Hook into `app.on('will-quit')` (or existing `StartupManager.onAppEnd()`).
  - Skipping this can leak the shortcut / block other apps on next run.
- Fits existing Manager → Channel → Preload pipeline used elsewhere in the app.
- Caveat: grabs key **exclusively**, system-wide.
  - If Spotify/Apple Music also running → only one app gets the event.
  - Expected/standard OS behavior, not a bug to fix.

### Ownership in this app
- Electron main process = right owner of global shortcut registration.
- 3 separate `WebContentsView`s (main / sidebar / topbar).
- Main process should notify `main` view via IPC (owns playback state) — same push pattern as `NotificationChannel.PUSH` / `AppNotificationService` already used in the app.

### How to listen — pseudo-code hint

Main process side (new small manager, registered like other managers):

```
import { globalShortcut } from 'electron'

function registerMediaKeyShortcuts(onEvent: (channel) => void) {
  globalShortcut.register('MediaNextTrack', () => onEvent(NEXT_TRACK))
  globalShortcut.register('MediaPreviousTrack', () => onEvent(PREVIOUS_TRACK))
  globalShortcut.register('MediaPlayPause', () => onEvent(PLAY_PAUSE))
}

function unregisterMediaKeyShortcuts() {
  globalShortcut.unregisterAll()
}
```

- Call `registerMediaKeyShortcuts` once, after the frontend view exists (needs a `webContents` to push events to).
- `onEvent` callback → `frontendTab.webContents.send(channel)`.
- Call `unregisterMediaKeyShortcuts` during app shutdown, mirroring `websocketServer?.close()` in `StartupManager.onAppEnd()`.

Preload / renderer side (same shape as `NOTIFICATION_API.onNotification`):

```
onNextTrack(callback) {
  ipcRenderer.on(MEDIA_NEXT_TRACK, () => callback())
}
onPreviousTrack(callback) {
  ipcRenderer.on(MEDIA_PREVIOUS_TRACK, () => callback())
}
onPlayPause(callback) {
  ipcRenderer.on(MEDIA_PLAY_PAUSE, () => callback())
}
```

- Frontend service (in `general`, injected where needed) subscribes to these callbacks once, on construction, and calls into `PlaybackService.playNext()` / `playPrev()` / `togglePlayPause()`.
- No polling, no renderer-side key listening — main process is the only source of these events.

---

## 2. Arrow Key Seek/Skip

### Tap behavior (industry convention)
- `ArrowRight` → seek forward, fixed step (10s).
- `ArrowLeft` → seek backward, same step.
- Instant. No delay on first press.

### Held-key behavior (ramping seek)
- Escalate step size over time:
  - 10s → 20s → 30s
  - then hold steady, no more growth.
- Must use own timer/interval.
  - NOT native OS keyboard repeat rate.
  - OS repeat timing inconsistent across platforms/settings.
- On `keyup` → reset back to step 1 (10s).
- Avoid double-triggering:
  - Browser fires synthetic repeated `keydown` while held (`event.repeat === true`).
  - Guard against this if also running own interval.

### Track-boundary behavior
- Forward seek past track end:
  - → skip to next track.
  - reset ramp/step index after skip.
- Backward seek before `0`:
  - → skip to previous track.
  - Alternative: clamp to `0` first press, only go prev on second press within X seconds.
  - Decide intentionally, don't just default.

### Architectural split
- Space / Escape:
  - simple, stateless, single-fire.
  - one `Subject`, fired once per keydown.
- Arrow seek:
  - stateful over time.
  - needs: is key held, how long, step index, running interval/timeout.
  - too much for generic shortcut service.

**Split of responsibility:**
- `KeyboardShortcutService`
  - only detects: ArrowLeft/Right pressed/released, not typing.
  - stays generic, dumb.
- `PlaybackService` (or similar)
  - owns ramp/timer/step logic.
  - talks directly to `seek()`, `playNext()`, `playPrev()`, position/duration.

### Needed additions
- `keyup` listener globally.
  - Currently only `keydown` is wired in `KeyboardShortcutService.initialize()`.
  - Needed for reset-on-release.

---

## 3. Guarding Unwanted Triggers

- Reuse existing `isTypingOrInteractiveTarget(event.target)` guard.
- Arrow keys are heavily overloaded already:
  - moving between form fields
  - navigating dropdowns/menus
  - moving text cursor in input
  - scrolling a `<select>`
- Without guard → arrow seek would hijack normal navigation.
  - e.g. renaming playlist, using a slider, navigating a list.

### Escape vs Arrow — different treatment
- Escape: blur first if typing, close dialog if not.
- Arrow seek: fully back off if typing/interactive target focused.
  - No safe "blur" equivalent for seeking.
  - Assume user wants normal cursor/nav behavior.

---

## 4. Summary Table

| Key/Combo | Mechanism | Scope | Notes |
|---|---|---|---|
| Space | `keydown` Subject (existing) | Renderer only | Guarded by `isTypingOrInteractiveTarget` |
| Escape | `keydown` Subject (existing) | Renderer only | Blur first if typing, else close dialog |
| ArrowRight/Left (tap) | `keydown` + guard | Renderer only | Instant ±10s seek |
| ArrowRight/Left (held) | `keydown` + `keyup` + interval timer | Renderer only | Ramps 10→20→30s, resets on keyup/skip |
| MediaNextTrack/Prev/PlayPause | Electron `globalShortcut` | OS-wide, works unfocused | Must `unregisterAll()` before quit |
| MediaSession API | `navigator.mediaSession.setActionHandler` | Renderer, while active media doc | Bonus OS "Now Playing" integration |

---

## 5. Open Decisions (TBD before implementation)

- [ ] Exact interval timing for ramp steps (e.g. 700ms per step?).
- [ ] Backward-seek-at-start: always prev track, or clamp-then-prev?
- [ ] Do sidebar/topbar also need media key / play-pause handling, or main only?

