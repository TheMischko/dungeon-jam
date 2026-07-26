---
applyTo: "frontend/**/*.{ts,html,scss,json}"
---

# Frontend Architecture Instructions (Angular Workspace)

You WILL use this document to understand and work within the Angular frontend of Dungeon Jam. It describes workspace layout, coding standards, data flows, and Electron IPC usage patterns so you can implement features safely and idiomatically.

## 1. Workspace Overview

You WILL recognize that the frontend is an Angular multi-project workspace located in `frontend/` with four projects:
- `projects/general` — a shared library of UI components, services, signal stores, icons, and pipes. It is built with `ng-packagr` and consumed by the three applications.
- `projects/main` — the primary music player UI rendered in the main view.
- `projects/sidebar` — the navigation and quick settings panel rendered in a side view.
- `projects/topbar` — the application menu and tab manager rendered in a top view.

You WILL confirm build/serve configuration from `frontend/angular.json`:
- Each application uses `@angular/build:application` and serves on distinct ports: main 4200, sidebar 4201, topbar 4202.
- Global styles and shared assets are provided from `projects/general/styles` and `projects/general/assets`.
- Components are generated as `standalone: true` with `changeDetection: OnPush` and `style: scss` by default for all projects.
- The `general` project is of type `library` and built via `@angular/build:ng-packagr` using `projects/general/ng-package.json`.

You WILL note style preprocessor options include shared style paths: `stylePreprocessorOptions.includePaths: ["projects/general/styles"]`.

## 2. Coding Standards & Conventions

You WILL adhere to the following conventions derived from workspace configuration and existing code:
- Use strict typing and interfaces for all data contracts.
- Prefer signal state management over observable streams in components; services should convert window APIs to Observables, and stores should consume those Observables to manage state.
- Avoid anonymous function in bodies of other functions. Create a private method if the component or service needs such functionality.
- Use Smart-Dummy architecture, when creating complex components. The Smart components handles the business logic and provides data for the Dummy components, which servers as the View layer and renders the data correctly and passes events.
- Move any new color or typography styles to the `general` project and use them across the apps. Those files are in `frontend/projects/general/styles` folder and the individual `*.scss` files.
- Components: standalone, OnPush change detection, SCSS styles.
- Import aliases: shared models use `@shared/...`; general library services/components use `@general/...`.
- Strict TypeScript: create and use interfaces for data exchanged over IPC.
- RxJS-first in services: Electron API calls are wrapped in Observables using `Subject` to bridge window API Promises to Observable streams.
- Signal Stores: State management is implemented with `@ngrx/signals` and `@ngrx/signals/entities` for entities, adopting `rxMethod` for side effects and async flows.

## 3. Module & Directory Structure

You WILL understand core directories under `projects/general/src/lib/`:
- `components/` — reusable UI components (example: `general.component.ts`).
- `services/` — Angular services that wrap Electron window APIs (e.g., `playlist-api.service.ts`, `tag-api.service.ts`).
- `stores/` — Signal-based stores for application state (e.g., `playlist.store.ts`, `tags.store.ts`).
- `icons/`, `pipes/` — supporting presentation utilities.

Applications (`main`, `sidebar`, `topbar`) consume the general library and provide their own `src/` with `main.ts`, `index.html`, and feature-specific components.

## 4. Electron IPC Integration Pattern

You WILL never call Electron directly from Angular components. Instead, you WILL:
- Use services in `projects/general/src/lib/services` that access `window.*` APIs exposed by Electron preload scripts.
- Convert Promise-based window API calls to Observables via RxJS `Subject`, ensuring uniform consumption by components and stores.

Example pattern from `playlist-api.service.ts`:
- Cast `window` to a typed interface (`PlaylistApiWindow`).
- Wrap `window.PLAYLIST_API.method(...)` in a `Subject` and expose `subject.asObservable()`.

Example pattern from `tag-api.service.ts`:
- Access `window.TAG_API` methods, wrap results and errors into Observables.

You WILL rely on shared type definitions from `shared/models/*` for the data contracts used across IPC boundaries.

## 5. State Management with Signal Stores

You WILL implement state using `@ngrx/signals`:
- `signalStore` defines store state and methods.
- `withState` holds local flags (e.g., `loading`, `initialized`).
- `withEntities` with `@ngrx/signals/entities` manages normalized entity collections using `entityConfig` and `type<T>()`.
- `rxMethod` wires async effects and integrates RxJS operators (`switchMap`, `tap`, `catchError`, `finalize`, `debounceTime`).
- `patchState` mutates signals and entity sets via helpers like `setAllEntities` or `setEntities`.

Illustrative examples:
- `playlist.store.ts` — provides `load`, `insertNew`, and `addNewTracks`:
  - `load` sets `loading` and `lastLoadQuery`, debounces requests, calls `PlaylistApiService.getAllPlaylists(query)`, and writes normalized entities with `setAllEntities`.
  - `insertNew` calls `PlaylistApiService.insertPlaylist(data)` and triggers a reload using the last query.
  - `addNewTracks` calls `PlaylistApiService.addTracks(data)`, then selectively patches only the playlists present in the local store using `setEntities`.
- `tags.store.ts` — provides `loadAll` and `getById` with initialization hooks:
  - `withHooks({ onInit })` triggers an initial load and sets `initialized: true`.
  - Entities are set via `setAllEntities` and can be retrieved from `store.entityMap()`.

You WILL prefer `rxMethod` for side-effecting operations instead of calling services directly from components.

## 6. Data Flow

You WILL follow this end-to-end flow for frontend operations:
- Component dispatches a store method (e.g., `PlaylistStore.load(query)` or `TagsStore.loadAll()`).
- Store uses `rxMethod` with RxJS operators to call a service method.
- Service invokes a `window.*` API exposed by Electron preload, returning a Promise.
- Service bridges Promise to Observable, emitting values or errors via `Subject`.
- Store consumes the Observable, taps into results to patch state and entities, and handles errors gracefully.
- Components subscribe to signals (not Observables directly) and render derived state.
  - Components are standalone. (`standalone: true`)

You WILL keep components lean: they render signals, and delegate all async work to stores and services.

## 7. Styling & Assets

You WILL use SCSS across projects with shared global styles:
- Application `styles.scss` includes shared styles: `projects/general/styles/global.scss`.
- Assets are pulled from each project’s `public/` plus `projects/general/assets` per `angular.json` build options.


## 8. Implementation Guidelines

You WILL follow these concrete rules when adding features:
- Shared logic goes into `projects/general` as services, stores, components, or utilities. Do not duplicate across apps.
- Any new Electron IPC access MUST be via a new or existing service under `projects/general/src/lib/services`. Define a typed `Window` interface for the API.
- Maintain strict typing using models from `shared/models/*`. If a new model is needed, add it under `shared/models` in the repository root and consume via `@shared/...` alias.
- Prefer signal stores for state and entity management. Use `@ngrx/signals/entities` for collections.
- Use `OnPush` and pure, presentational components. Keep data fetching and mutation out of components.
- Handle errors with `catchError`, log via `console.error`, and avoid throwing from services; surface errors as Observable `error` emissions.
- Debounce or throttle high-frequency requests (`debounceTime` as seen in `playlist.store.ts`).

## 9. Known Interfaces & Models

You WILL rely on these known patterns and files:
- Preload APIs: `window.PLAYLIST_API`, `window.TAG_API` (see backend preload under `src/preload/*.ts`).
- Models from `shared/models/`: `playlist.model.ts`, `tag.model.ts`, `request.model.ts`, `common.model.ts`.
- Sort conventions: `SortDirection` from `@shared/models/common.model`.

## 10. Do & Don’t Summary

You WILL:
- Route all Electron interactions through typed services either in current Angular project or in `general`.
- Use signal stores for state management and side effects.
- Keep components lean and OnPush.
- Use SCSS and shared styles.
- Leverage shared models and maintain strict typing.
- Use Angular Material components and patterns for UI consistency.

You WILL NOT:
- Call Electron APIs directly in components.
- Duplicate services or stores across apps.
- Perform heavy logic in components.
- Introduce untyped IPC or any `any` types for data contracts.

## 11. Electron Managers → Preload APIs → Angular Services Pipeline

You WILL understand and apply this backend-to-frontend pipeline when adding or modifying functionality:

- Backend Managers (Electron Main Process):
  - Location: `src/main/managers/`.
  - Role: Implement domain logic (e.g., tracks, files, playlists, tags, discord, view, redirect, stored playback).
  - Exposure: Public methods are invoked via preload APIs and communicate with the frontend using IPC.

- Preload Layer (Context Bridge):
  - Location: `src/preload/*.ts` with `src/preload.ts` wiring.
  - Role: Define strict, typed interfaces and expose them as `window.*` APIs using `contextBridge.exposeInMainWorld`.
  - Pattern: Each domain has a dedicated preload API file (e.g., `playlist-api.ts`, `tag-api.ts`). `preload.ts` imports those modules and attaches them to `window`.
  - Example: `preload.ts` exposes `GENERAL_API`, `TRACK_API`, `AUDIO_FILES_API`, `PLAYBACK_API`, `PLAYLIST_API`, `TAG_API` and declares them on the global `Window` interface for typing.

- Angular Services (Frontend):
  - Location: `frontend/projects/general/src/lib/services/`.
  - Role: Wrap `window.*` APIs into RxJS Observables. Provide typed methods consumed by signal stores and components.
  - Pattern: Cast `window` to a typed `*ApiWindow` interface, call `window.*` methods, and bridge Promises to Observables via `Subject`.

### Notes & Rules

- Do not expose raw `ipcRenderer` to the window. Always wrap calls in typed API functions within preload files.
- Keep preload APIs minimal and domain-focused. One file per domain keeps concerns clear.
- Always update the global `Window` type in `src/preload.ts` to include any new API, otherwise TypeScript consumers in Angular will have type errors.
- Use `GeneralChannels` and other shared channel enums for consistency; do not hardcode strings in multiple places.