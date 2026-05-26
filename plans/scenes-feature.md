# Scenes Feature — Design & Implementation Plan

## 1. Feature Overview

**Scenes** is a new module in Dungeon Jam designed for Dungeon Masters to prepare and perform audio
for live DnD sessions. The core idea mirrors a DJ workflow: the DM pre-builds a library of named
atmospheric setups (Scenes), groups them into Sessions, and switches between them live with a
single click.

### Entities

| Entity | Description |
|--------|-------------|
| **Scene** | A single atmospheric setup: one playlist for music, a set of looping ambient sound effects, and a set of one-shot stinger buttons. The primary entity of this feature. |
| **Session** | An ordered, reusable collection of Scene references representing one game session's planned soundtrack. A subsection of the Scenes module. |

Scenes are **reusable** — the same *Tavern* Scene can appear in Session 3, 7, and 12. Over time,
the DM builds a Scene library that makes Session assembly fast.

---

## 2. Design Decisions

| Topic | Decision |
|-------|----------|
| Music source | Scene references an existing `Playlist` by ID (Alpha). Custom track lists are a future extension. |
| Ambience | A list of `SoundEffect` references, all loop simultaneously when Scene activates. |
| Stingers | A separate list of `SoundEffect` references rendered as large one-shot trigger buttons. |
| Per-scene volumes | Both ambience and stingers store a scene-specific `volume` override (0–1). Runtime volume adjustments during a session are **not persisted**. |
| Global vs scene volume | Scene volume fully overrides the SoundEffect's global volume. Separate contexts, no inheritance. |
| Stinger retrigger | Clicking a stinger while it is already playing **restarts** it from the beginning. |
| Intro track | Alpha supports a single intro track (`introTrackIds[0]`). The field is stored as `string[]` to support multiple intro tracks in a future version. When a Scene activates, the intro track plays first, then the playlist queue follows. |
| Scene activation | Hard cut — current music and ambience stop immediately. Crossfade is a separate future feature. |
| Stop Scene | Stops all Scene-owned audio (music via the main player + all ambience loops). Sound effects triggered independently from the Sound Effects module are unaffected. |
| Player integration | Scene music routes through the **existing main player**. Activating a Scene loads the Scene's playlist into the player queue (intro track first) and starts playback. No new audio infrastructure. |
| Edit / Run mode | No separate modes. Consistent with existing app patterns — one unified view where play actions are prominent and edit actions are accessible but secondary. |
| Session cover image | Sessions have no `imageUrl`. Cover is derived from the first Scene in the Session that has an image. Falls back to a placeholder icon. |
| Session ordering | Sessions sorted by `dateOfSession` descending (most recent first). |
| Scene navigation in Session | Free jump — the DM can activate any Scene at any time, non-linear. |

---

## 3. Data Models

Create `shared/models/scene.model.ts`:

```typescript
export interface SceneSoundRef {
  soundEffectId: string;
  volume: number; // 0–1, scene-specific override; overrides global SoundEffect volume
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  playlistId: string | null;
  introTrackIds: string[];   // Alpha: only [0] is used; list prepared for future multi-intro support
  ambience: SceneSoundRef[]; // all loop simultaneously on activation
  stingers: SceneSoundRef[]; // one-shot trigger buttons
  order: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface SceneInsertQuery {
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  playlistId?: string;
}

export interface SceneUpdateQuery {
  id: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  playlistId?: string | null;
  introTrackIds?: string[];
  ambienceAdded?: SceneSoundRef[];
  ambienceRemoved?: string[];            // soundEffectIds to remove
  ambienceVolumeUpdate?: SceneSoundRef;  // update volume for one ref
  stingersAdded?: SceneSoundRef[];
  stingersRemoved?: string[];
  stingerVolumeUpdate?: SceneSoundRef;
  tagsAdded?: string[];
  tagsRemoved?: string[];
  order?: number;
}
```

Create `shared/models/session.model.ts`:

```typescript
export interface Session {
  id: string;
  name: string;
  description?: string;
  dateOfSession?: Date;
  sceneIds: string[]; // ordered list; defines left-panel order in run view
  order: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface SessionInsertQuery {
  name: string;
  description?: string;
  dateOfSession?: Date;
}

export interface SessionUpdateQuery {
  id: string;
  name?: string;
  description?: string | null;
  dateOfSession?: Date | null;
  scenesAdded?: string[];
  scenesRemoved?: string[];
  sceneIds?: string[]; // full replacement for reorder
}
```

---

## 4. Database Schema

Update `src/main/database/init-database.ts`:

- Add `scenes: Scene[]` table initialised as `[]`
- Add `sessions: Session[]` table initialised as `[]`

Both tables follow the same pattern as `playlists` and `soundEffects`.

---

## 5. IPC Channels

Add to `shared/models/channels.model.ts`:

```typescript
export enum SceneChannel {
  GET_ALL     = 'scenes/get-all',
  GET_BY_ID   = 'scenes/get-by-id',
  INSERT      = 'scenes/insert',
  UPDATE      = 'scenes/update',
  DELETE      = 'scenes/delete',
  CHANGE_ORDER = 'scenes/change-order',
}

export enum SessionChannel {
  GET_ALL     = 'sessions/get-all',
  GET_BY_ID   = 'sessions/get-by-id',
  INSERT      = 'sessions/insert',
  UPDATE      = 'sessions/update',
  DELETE      = 'sessions/delete',
}
```

---

## 6. Backend — Managers

### 6.1 SceneManager

Create `src/main/managers/scene.manager.ts`.

Follows the exact same singleton pattern as `PlaylistManager` / `SoundEffectManager`:

- `getInstance()` — creates `DatabaseProvider<Scene>`, resolves `ImageManager`,
  `DisplayOrderManager`, and `TagsManager` dependencies, then calls `registerIpcHandlers()`
- IPC handlers for all `SceneChannel` variants
- `insert(query: SceneInsertQuery)` — assigns UUID, timestamps, empty ambience/stingers/introTrackIds
- `update(query: SceneUpdateQuery)` — handles partial updates; array fields use add/remove
  patch pattern (same as `PlaylistManager.update`)
- `delete(id: string)` — removes scene from all Sessions that reference it (`sessionManager.removeSceneFromAll(id)`)
- `getAll(query)` — supports tag filtering and name search
- Uses `ImageManager` for `imageUrl` (same pattern as Playlist)
- Uses `DisplayOrderManager` for ordering (same pattern as Playlist / SoundEffect)

### 6.2 SessionManager

Create `src/main/managers/session.manager.ts`.

Simpler than SceneManager — Sessions contain only metadata and a list of Scene IDs:

- `getInstance()` — resolves `DatabaseProvider<Session>` dependency
- IPC handlers for all `SessionChannel` variants
- `insert(query: SessionInsertQuery)` — assigns UUID, empty `sceneIds[]`, timestamps
- `update(query: SessionUpdateQuery)` — supports add/remove scenes and full `sceneIds`
  replacement (for drag-and-drop reorder)
- `delete(id: string)` — deletes Session only; referenced Scenes are unaffected
- `removeSceneFromAll(sceneId: string)` — called by SceneManager on Scene delete; removes
  the scene from every Session's `sceneIds` array
- `getAll()` — sorted by `dateOfSession` descending, then `dateCreated` descending as tiebreak

### 6.3 Register in managers.config.ts

Add after the `SoundEffect` phase (Phase 4 — depends on Tags, Image, DisplayOrder):

```typescript
{
  name: 'Scene',
  initFunction: async () => {
    await SceneManager.getInstance();
  },
},
{
  name: 'Session',
  initFunction: async () => {
    await SessionManager.getInstance();
  },
},
```

---

## 7. Preload APIs

Create `src/preload/scene-api.ts`:

```typescript
export const SCENE_API = {
  getAll:      (query?)  => ipcRenderer.invoke(SceneChannel.GET_ALL, query),
  getById:     (id)      => ipcRenderer.invoke(SceneChannel.GET_BY_ID, id),
  insert:      (query)   => ipcRenderer.invoke(SceneChannel.INSERT, query),
  update:      (query)   => ipcRenderer.invoke(SceneChannel.UPDATE, query),
  delete:      (id)      => ipcRenderer.invoke(SceneChannel.DELETE, id),
  changeOrder: (query)   => ipcRenderer.invoke(SceneChannel.CHANGE_ORDER, query),
};
```

Create `src/preload/session-api.ts`:

```typescript
export const SESSION_API = {
  getAll:   (query?) => ipcRenderer.invoke(SessionChannel.GET_ALL, query),
  getById:  (id)     => ipcRenderer.invoke(SessionChannel.GET_BY_ID, id),
  insert:   (query)  => ipcRenderer.invoke(SessionChannel.INSERT, query),
  update:   (query)  => ipcRenderer.invoke(SessionChannel.UPDATE, query),
  delete:   (id)     => ipcRenderer.invoke(SessionChannel.DELETE, id),
};
```

Expose both via `src/preload.ts` context bridge:
`window.SCENE_API` and `window.SESSION_API`.

---

## 8. Frontend — Angular

### 8.1 Module structure

New route module under `frontend/projects/main/src/app/modules/scenes/`.

```
modules/scenes/
├── scenes.routes.ts
├── pages/
│   ├── scenes-library/          # /scenes — Scene card grid
│   ├── scene-detail/            # /scenes/:id — detail + playback console
│   ├── sessions-library/        # /scenes/sessions — Session card grid
│   └── session-run/             # /scenes/sessions/:id — split run view
└── components/
    ├── scene-console/           # Reusable two-column playback panel (shared between
    │                            #   scene-detail and session-run)
    ├── scene-card/              # Card for Scenes library grid
    ├── session-card/            # Card for Sessions library grid
    ├── scene-create-modal/      # Modal: name, description, image, playlist
    └── session-create-modal/    # Modal: name, description, dateOfSession
```

### 8.2 Routes

```
/scenes                  → ScenesLibraryComponent
/scenes/:id              → SceneDetailComponent
/scenes/sessions         → SessionsLibraryComponent
/scenes/sessions/:id     → SessionRunComponent
```

Add a `Scenes` entry to the sidebar navigation (alongside Library, Playlists, Sound Effects).
Within the Scenes module, a sub-navigation bar at the top switches between **Scenes** and
**Sessions**.

### 8.3 Services

Create `frontend/projects/general/src/lib/services/scene.service.ts`
and `session.service.ts` following the existing service pattern
(call `window.SCENE_API` / `window.SESSION_API`, expose signals or observables for consumers).

### 8.4 SceneConsoleComponent

The core reusable component. Accepts a `scene: Scene` input signal.

```
┌─────────────────────────────────────┬────────────────────────────┐
│  MUSIC                              │  AMBIENCE                  │
│                                     │                            │
│  Playlist: [Tavern Music]  ▶ play  │  🔊 Rain         ──●──  ⏹ │
│  Intro:    [A Warm Welcome] ✕       │  🔊 Fireplace    ──●──  ⏹ │
│                                     │  🔊 Crowd murmur ──●──  ⏹ │
│  ─ Queue (shuffle order) ──────     │  + Add Ambience            │
│  ▶ A Warm Welcome          [now]   ├────────────────────────────┤
│    Bard's Tale                      │  STINGERS                  │
│    Merchant's March                 │                            │
│    The Hearthstone Inn              │  [ Dragon Roar  🔊──● ]   │
│    ...                              │  [ Thunder      🔊──● ]   │
│  (scrollable)                       │  [ Crowd Gasp   🔊──● ]   │
│                                     │  + Add Stinger             │
└─────────────────────────────────────┴────────────────────────────┘
```

- Left column: current queue reflecting live player state (shuffle order visible). Clicking a
  track plays it immediately via the main player.
- Right column top (Ambience): per-effect volume slider + individual stop button. All effects
  loop simultaneously.
- Right column bottom (Stingers): large trigger buttons + per-stinger volume slider. Clicking
  restarts the effect if already playing.
- Volume changes in the console are **runtime-only** and not persisted until the user explicitly
  saves them (a "Save volumes" action or auto-save on blur — TBD).

### 8.5 Scene Detail Page (`/scenes/:id`)

```
┌──────────────────────────────────────────────────────────────────┐
│  [cover image]  Scene Name                          [Edit ✏]     │
│                 Description text                                 │
│                 🏷 combat  🏷 dungeon  🏷 horror                  │
│                                                                  │
│  [ ▶ Play Scene ]   [ ⏹ Stop Scene ]                            │
├──────────────────────────────────────────────────────────────────┤
│  < SceneConsoleComponent (scene input) >                         │
└──────────────────────────────────────────────────────────────────┘
```

Edit button opens the existing-style modal for name/description/image/tags changes.
Playlist, ambience, and stinger management are handled inline within `SceneConsoleComponent`.

### 8.6 Scenes Library Page (`/scenes`)

```
┌─ Scenes ──────────────────────────────────────────────────────┐
│  [+ New Scene]   [Search...]   [Tag filters]                  │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ [image]  │  │ [image]  │  │ [image]  │  │  [icon]  │     │
│  │ Tavern   │  │ Dragon   │  │ Forest   │  │ City     │     │
│  │ 🏷social │  │ 🏷combat │  │ 🏷explor │  │ 🏷social │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│   ...                                                         │
└───────────────────────────────────────────────────────────────┘
```

Card design identical to Playlist cards. Quick-play button on hover activates the Scene.

### 8.7 Sessions Library Page (`/scenes/sessions`)

```
┌─ Sessions ────────────────────────────────────────────────────┐
│  [+ New Session]   [Search...]                                │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │ [derived cover image]│  │ [derived cover image]│          │
│  │ The Dragon Heist     │  │ Descent into Avernus │          │
│  │ May 26, 2026         │  │ May 12, 2026         │          │
│  │ 9 scenes             │  │ 6 scenes             │          │
│  └──────────────────────┘  └──────────────────────┘          │
│  ...  (sorted by dateOfSession desc)                          │
└───────────────────────────────────────────────────────────────┘
```

Cover is the first Scene in the Session that has an `imageUrl`. Falls back to a placeholder icon.

### 8.8 Session Run View (`/scenes/sessions/:id`)

```
┌─ Session: The Dragon Heist ──────────────────────────────────────────┐
│  ← Back to Sessions                                                  │
├──────────────────┬───────────────────────────────────────────────────┤
│  SCENES          │                                                   │
│  ─────────────   │   ▶ Play Scene    ⏹ Stop Scene                   │
│  ▶ [active]      │                                                   │
│  Tavern Arrival  │  < SceneConsoleComponent (activeScene input) >    │
│                  │                                                   │
│  Dragon Lair     │  (two-column layout: queue left,                  │
│                  │   ambience + stingers right)                      │
│  City Streets    │                                                   │
│                  │                                                   │
│  Throne Room     │                                                   │
│                  │                                                   │
│  Sewers          │                                                   │
│                  │                                                   │
│  [+ Add Scene]   │                                                   │
├──────────────────┴───────────────────────────────────────────────────┤
```

- Left panel: scrollable list of Scene names. Active Scene is clearly highlighted (strong border
  / background state). Clicking any Scene activates it (hard cut). Scenes can be reordered via
  drag-and-drop.
- Right panel: `SceneConsoleComponent` bound to the currently active Scene.
- No active Scene selected on initial load — right panel shows an empty / prompt state.

---

## 9. Alpha Scope vs Future

| Feature | Alpha | Future |
|---------|-------|--------|
| Scene music source | Playlist reference only | Custom inline track list |
| Intro tracks | Single track (`introTrackIds[0]`) | Multiple ordered intro tracks |
| Scene activation transition | Hard cut | Crossfade with configurable duration |
| Volume persistence | Manual save or auto-save on blur | TBD |
| Session active scene persistence | Runtime only (resets on reopen) | Optional "resume where I left off" |
| Scene reorder in library | DisplayOrder (existing system) | Drag-and-drop in grid |
| Scene reorder in Session | Drag-and-drop in left panel | — |
