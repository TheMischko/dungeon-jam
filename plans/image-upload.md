# Image Upload Feature

## Problem Statement

Users want to personalise their Playlists and Sound Effects with cover images, but currently neither supports any form of image association. The Playlist model has an `imageUrl` field that is exposed as a raw text input, requiring users to manually type a URL — which is impractical for local desktop use. Sound Effects have no image support at all. Without proper image upload and storage, the app UI lacks the visual richness expected from a modern music management tool.

---

## Solution

Introduce a dedicated image upload pipeline that allows users to pick an image from their local filesystem, automatically processes it (resize + compress), and stores it in a well-defined location inside the app's user data directory. A reusable `ImageUploadComponent` in the shared Angular library gives both the Playlist and Sound Effect forms a consistent, native-feeling upload experience with an instant preview. Images are cleaned up automatically when their parent entity is deleted or replaced.

---

## User Stories

1. As a user, I want to upload a cover image when creating a new playlist, so that I can visually identify it at a glance.
2. As a user, I want to upload a cover image when editing an existing playlist, so that I can update the visual representation at any time.
3. As a user, I want to upload a cover image when creating a new sound effect, so that sound effects have a distinct visual identity in the grid.
4. As a user, I want to upload a cover image when editing an existing sound effect, so that I can change the image after creation.
5. As a user, I want to click a button to open a native OS file picker for image selection, so that I can browse my files in a familiar way.
6. As a user, I want to see a preview of the selected image before I save the form, so that I can confirm the right image was chosen.
7. As a user, I want the app to automatically resize and compress my image on upload, so that the app does not consume excessive disk space over time.
8. As a user, I want to remove an image from a playlist without deleting the playlist, so that I can revert to a no-image state.
9. As a user, I want to remove an image from a sound effect without deleting the sound effect, so that I can revert to a no-image state.
10. As a user, I want images to be deleted from disk automatically when I delete a playlist, so that no orphaned files accumulate.
11. As a user, I want images to be deleted from disk automatically when I delete a sound effect, so that no orphaned files accumulate.
12. As a user, I want replacing an existing image to automatically delete the old one, so that disk space is not wasted.
13. As a user, I want image files to be stored inside the application's data directory, so that they are isolated from my music library.
14. As a user, I want to delete a playlist, so that I can remove playlists I no longer need (prerequisite for image cleanup).
15. As a user, I want image uploads to accept common image formats (JPEG, PNG, WebP, GIF), so that I am not restricted to a specific format.

---

## Implementation Decisions

### Schema Changes

- Add `imageUrl?: string` to the `SoundEffect`, `SoundEffectCreateData`, and `SoundEffectUpdateData` interfaces. The field stores a local absolute file path to the processed image.
- `Playlist.imageUrl` already exists; no schema change needed, but the semantic changes from "any URL" to "local processed image path".

### New: `ImageManager` (Backend)

A new singleton manager responsible for all image concerns:

- **`openImagePicker(): Promise<string | null>`** — Opens an Electron native file dialog filtered to image types. Returns the selected source path, or `null` if cancelled.
- **`processAndSaveImage(sourcePath: string, entityType: 'playlists' | 'sound-effects', entityId: string): Promise<string>`** — Reads the source image, resizes to max 512×512 px (preserving aspect ratio), converts to JPEG at 80% quality using `sharp`, saves to `<userData>/images/<entityType>/<entityId>.jpg`, returns the saved path.
- **`deleteImage(storedPath: string): Promise<void>`** — Deletes the image file at `storedPath` from disk. No-ops if the file does not exist.

Storage root: `app.getPath('userData')/images/` with subdirectories `playlists/` and `sound-effects/`.

### New: `ImageChannel` Enum

Add `ImageChannel` to `channels.model.ts`:
- `OPEN_PICKER` — triggers `openImagePicker`
- `PROCESS_AND_SAVE` — triggers `processAndSaveImage`
- `DELETE` — triggers `deleteImage`

### New `IMAGE_API` Preload

Expose `IMAGE_API` on the `window` object via the context bridge:
- `openPicker(): Promise<string | null>`
- `processAndSave(sourcePath: string, entityType: string, entityId: string): Promise<string>`
- `delete(storedPath: string): Promise<void>`

### Modified: `PlaylistManager`

- Add `delete(id: string): Promise<void>` method and a corresponding `PlaylistChannel.DELETE` IPC handler.
- On delete: call `ImageManager.deleteImage(playlist.imageUrl)` if an image is set, then remove the playlist record from the database.
- On update (image replacement): if `query.imageUrl` is provided and differs from the current `playlist.imageUrl`, call `ImageManager.deleteImage` on the old path before persisting.

### Modified: `SoundEffectManager`

- `deleteById`: if the sound effect has an `imageUrl`, call `ImageManager.deleteImage` before removing the record.
- `update`: if `data.imageUrl` is provided and differs from the existing `imageUrl`, call `ImageManager.deleteImage` on the old path before persisting.

### Modified: `managers.config.ts`

Register `ImageManager` in Phase 1 (core infrastructure, no data dependencies).

### New: `ImageUploadComponent` (Frontend, `general/`)

A reusable Angular component:

- **Inputs:** `storedImagePath: string | null` (current stored path, for edit forms), `entityId: string` (used when calling `processAndSave`).
- **Outputs:** `imageSourceSelected: EventEmitter<string | null>` — emits the selected source path (or `null` on clear), so the parent form can hold it until submit.
- **Behaviour:**
  - Displays a click target (placeholder or current image preview).
  - On click, calls `IMAGE_API.openPicker()` and, on a non-null result, renders a local preview using `file://` protocol.
  - Shows a clear/remove button when an image is selected.
  - Does **not** call `processAndSave` itself — that is the form's responsibility at submit time.

### Modified: `PlaylistFormComponent` / `SoundEffectFormComponent`

- Replace the `imageUrl` text input in `PlaylistFormComponent` with `ImageUploadComponent`.
- Add `imageUrl` field to `SoundEffectFormData` and render `ImageUploadComponent` in `SoundEffectFormComponent`.
- In form submit handlers (create/update modals):
  1. If a new image source path is pending, call `IMAGE_API.processAndSave(sourcePath, entityType, entityId)` to get the stored path.
  2. If the user cleared the image, call `IMAGE_API.delete(existingStoredPath)` to remove the old file.
  3. Pass the resulting `imageUrl` (or `null`) in the create/update query.

---

## Implementation Plan

### Phase 1 — Backend Foundation

1. Install `sharp` as a production dependency.
2. Create `ImageManager` with `openImagePicker`, `processAndSaveImage`, and `deleteImage`.
3. Add `ImageChannel` to `channels.model.ts`.
4. Expose `IMAGE_API` in `preload.ts`.
5. Register `ImageManager` in `managers.config.ts` (Phase 1).

### Phase 2 — Model & Manager Updates

6. Add `imageUrl` to `SoundEffect`, `SoundEffectCreateData`, `SoundEffectUpdateData` models.
7. Update `SoundEffectManager` — image cleanup on delete and on update.
8. Add `delete` to `PlaylistManager` — image cleanup on delete and on update.

### Phase 3 — Frontend Shared Component

9. Create `ImageUploadComponent` in `general/` with picker IPC call, preview, and clear support.

### Phase 4 — Form Integration

10. Integrate `ImageUploadComponent` into `PlaylistFormComponent` (replace text input).
11. Integrate `ImageUploadComponent` into `SoundEffectFormComponent` (new field).
12. Update create/update modal submit handlers to call `IMAGE_API.processAndSave` or `IMAGE_API.delete` as appropriate.

---

## Testing Decisions

### What makes a good test

Tests should verify **external observable behaviour** only — what the module returns or what side effects it produces — without asserting on internal implementation details such as which private methods were called or in what order. Mocks should be used at module boundaries (IPC, filesystem, `sharp`, Electron `dialog`, `DatabaseProvider`).

### Prior Art

- `src/main/managers/playlist.manager.spec.ts` — manager tests using a mock `DatabaseProvider` and mock IPC event data.
- `src/main/managers/track.manager.spec.ts` — similar pattern; useful reference for testing create/update/delete flows with database mocks.
- `src/main/managers/discord-token.manager.spec.ts` — tests for a manager with side effects.
- `src/main/database/database-provider.spec.ts` — unit tests for the database layer.

### Modules to Test

| Module | What to test |
|---|---|
| `ImageManager` | `processAndSaveImage` saves a correctly-named JPEG to the expected path; `deleteImage` removes a file and no-ops on missing files; `openImagePicker` returns `null` when the dialog is cancelled |
| `PlaylistManager` | `delete` removes the playlist record and triggers image deletion when `imageUrl` is set; `update` triggers old-image deletion when `imageUrl` changes |
| `SoundEffectManager` | `deleteById` triggers image deletion when `imageUrl` is set; `update` triggers old-image deletion when `imageUrl` changes |

---

## Out of Scope

- Drag-and-drop image upload (click-to-browse only).
- Serving images via the local HTTP server.
- Image cropping or manual framing UI.
- Support for animated GIFs (converted to static JPEG on processing).
- Bulk image import or auto-matching images to playlists/tracks by metadata.
- Image upload for Track entities.
- Any cloud/remote image URL fallback.

---

## Further Notes

- The `sharp` package uses native binaries and must be included in the Electron build configuration. Ensure `esbuild.config.mjs` externalises `sharp` correctly (it should already be handled by `esbuild-node-externals`, but verify).
- The `imageUrl` field on `Playlist` currently accepts any string (free text input). After this feature, its contract changes to "local processed image path or null". Existing playlists with a manually-typed URL in this field will render a broken preview; this is acceptable as the feature was not previously documented or actively used.
- Image filenames are keyed by entity ID (`<entityId>.jpg`), so re-uploading an image for the same entity always overwrites the previous file — no stale versioned files accumulate.
