---
applyTo: "tests/**/*.{ts,feature}"
---

# E2E Acceptance Testing Instructions for Dungeon Jam

## Overview

Dungeon Jam uses **Cucumber.js** with **cucumber-tsflow** and **Playwright** for acceptance tests. Tests are located in `tests/` and run against a real Electron instance.

**Key commands:**
- `npm run test:e2e-build` — full production build + run tests (use this the first time, or after any backend/frontend code change)
- `npm run test:e2e` — run tests only, no rebuild (use this when only test files changed)

---

## Directory Structure

```
tests/
├── context/          # Shared test state (AppWindows, TestContext)
├── apis/             # Programmatic data seeding via IPC APIs
├── utils/            # App launch helpers (do not modify without good reason)
├── steps/            # Step definitions (cucumber-tsflow)
│   ├── base.steps.ts               # App lifecycle — launch, teardown, DB cleanup
│   ├── data-preparation.steps.ts   # General steps for seeding test data via APIs
│   ├── main/                       # Steps for the main window
│   ├── sidebar/                    # Steps for the sidebar window
│   └── topbar/                     # Steps for the topbar window
├── pages/            # Page Object Model
│   ├── _base/                # Base page classes (one per window)
│   ├── main/
│   ├── sidebar/
│   └── topbar/
├── selectors/        # CSS / data-testid selector constants
│   ├── main/
│   ├── sidebar/
│   └── topbar/
└── features/         # Gherkin feature files
    ├── main/
    ├── sidebar/
    └── topbar/
```

### The Three Modules

The application has three always-active windows: **main**, **sidebar**, and **topbar**. All three are live simultaneously during every test scenario. The directory structure mirrors these three modules in `steps/`, `pages/`, `selectors/`, and `features/`.

All step files are auto-discovered via a global glob (`tests/steps/**/*.ts`). No manual registration is needed — placing a file in the correct subdirectory is sufficient. Steps from any module can be used in any scenario, because all three windows are always running.

---

## Architectural Rules

### 1. File Creation Policy

When adding a new feature test:
- **Always create a new file** for new features or domain-specific behavior
- **Reuse existing steps/pages/selectors** for common interactions (e.g. sidebar navigation steps already exist)
- Scan existing files before writing any new step to avoid duplicates

New feature = new files in all four layers: `.feature`, `.steps.ts`, `.page.ts`, `.selectors.ts`

### 2. Step Classes and `@binding`

Every step class **must** have `@binding([TestContext])`, including subclasses of `BaseSteps`. cucumber-tsflow requires this decorator on every class that contains step definitions (`@given`, `@when`, `@then`).

```typescript
// CORRECT
@binding([TestContext])
export class PlaylistSteps extends BaseSteps {
  @then('there should be playlist with name {string}')
  async playlistIsOnLandingPage(playlistName: string): Promise<void> { ... }
}
```

`BaseSteps` owns the app lifecycle (`@before` / `@after`). Subclasses inherit it and gain access to `this.context` (which holds Playwright `Page` references for all three windows) and `this.electronApp`.

### 3. App Lifecycle and DB Isolation

- `@before` in `BaseSteps`: launches Electron with `ENV=test`, waits for the app to be ready, and populates `this.context.windows` with `mainWindow`, `sidebarWindow`, and `topbarWindow`
- `@after` in `BaseSteps`: closes the Electron app and deletes `build/src/db_test.json`
- Every scenario starts with a **clean, empty database** — no state leaks between scenarios
- `waitForAppReadySignal` is a working placeholder timeout — do not modify it

### 4. TestContext

`TestContext` is the single shared state object injected into all step classes via cucumber-tsflow:

```typescript
export class TestContext {
  public windows!: AppWindows;
}

export type AppWindows = {
  mainWindow: Page;
  sidebarWindow: Page;
  topbarWindow: Page;
};
```

Access the correct window in page objects via `context.windows.mainWindow`, `context.windows.sidebarWindow`, or `context.windows.topbarWindow`.

---

## Page Object Model

### Base Pages

Each window has a base page class in `tests/pages/_base/`:

| Class | Window |
|---|---|
| `BaseMainPage` | `context.windows.mainWindow` |
| `BaseSidebarPage` | `context.windows.sidebarWindow` |
| `BaseTopbarPage` | `context.windows.topbarWindow` |

Feature-specific page classes extend the appropriate base:

```typescript
export class PlaylistLandingPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  getPlaylistCard(playlistName: string): Locator {
    return this.page.locator(PlaylistLandingSelectors.CARD_WITH_TEXT(playlistName)).first();
  }
}
```

Page classes expose **locators and interactions only**. No assertions inside page classes.

---

## Selectors

Selectors are centralized in `tests/selectors/`, one file per page/feature, organized by module.

```typescript
export class PlaylistLandingSelectors {
  static readonly CARD = '.grid-content .grid-item';
  static readonly CARD_WITH_TEXT = (title: string) => `${this.CARD}:has-text("${title}")`;
}
```

**Selector priority:**
1. Use `[data-testid="..."]` when the attribute is present on the element
2. Fall back to CSS class selectors when `data-testid` is not available

Never inline selector strings in step files or page files — always define them in the selectors layer.

---

## APIs Layer

The `tests/apis/` directory contains helpers that call `window.*_API` methods via `page.evaluate()`. These bypass the UI and talk directly to the Electron IPC bridge.

**APIs are for test data seeding only.** Use them in `Background` steps to prepare state before a scenario. Never use them to assert behavior.

```typescript
// CORRECT — seed data in Background
@given('there is a playlist prepared called {string}')
async preparePlaylist(playlistName: string): Promise<void> {
  await createPlaylist(this.page.page, playlistData);
}

// WRONG — asserting via API instead of UI
@then('the playlist exists')
async verify(): Promise<void> {
  const playlists = await page.evaluate(() => window.PLAYLIST_API.getPlaylists()); // ❌
}
```

---

## Feature Files and Gherkin Conventions

### Tags

Every feature file **must** have at least one domain tag. Use broad categories that correspond to app features:

| Tag | When to use |
|---|---|
| `@playlists` | Playlist management |
| `@library` | Track/song library |
| `@player` | Audio playback |
| `@discord` | Discord integration |
| `@sidebar` | Sidebar navigation |
| `@topbar` | Topbar / tab management |
| `@tags` | Tag management |
| `@sound-effects` | Sound effects |

```gherkin
@playlists
Feature: Playlist Landing page
```

### Background Rules

`Background` is for **data preparation and application initialization only**. Every scenario in the feature file must genuinely require that background setup. If a scenario doesn't need the background, it belongs in a different feature file.

Do not use `Background` for UI navigation that only some scenarios require.

### Step Text Rules

- Steps must be **short but complete sentences**
- Step text must be **self-scoping** — include enough context that it cannot be confused with a step from another feature or modal

```gherkin
# CORRECT — scope is clear
When the user clicks on save in create playlist modal
When the user opens the track context menu in the library

# WRONG — too generic, ambiguous
When the user clicks on save
When the user opens the context menu
```

### Step Reuse

Before writing a new step, scan existing step files. If an equivalent step already exists (e.g. `the user clicks on {string} in navigation menu`), reuse it — do not create a duplicate with slightly different wording.

---

## Adding a New Feature Test — Checklist

When asked to write acceptance tests for a new feature:

1. **Identify the domain tag** — pick from the list above or define a new one
2. **Check existing steps** — scan `tests/steps/**/*.ts` for reusable steps
3. **Create the feature file** — `tests/features/<module>/<feature-name>.feature`
   - Add domain tag
   - Group scenarios by shared Background
4. **Create the selectors file** — `tests/selectors/<module>/<feature-name>.selectors.ts`
   - Prefer `data-testid`, fall back to CSS
5. **Create the page file** — `tests/pages/<module>/<feature-name>.page.ts`
   - Extend the appropriate base page class
   - Expose locators and interaction methods only
6. **Create the steps file** — `tests/steps/<module>/<feature-name>.steps.ts`
   - Extend `BaseSteps`
   - Add `@binding([TestContext])`
   - Use APIs in `@given` for data seeding, page objects for `@when`/`@then`
7. **Add API helper if needed** — `tests/apis/<domain>.api.ts` for new IPC calls used in seeding
8. **Run** `npm run test:e2e-build` for first verification or `npm run test:e2e` (agent should validate its output by this and make sure it hands over working tests)

---

## Example: Complete Feature Test

**`tests/features/main/playlist-landing.feature`**
```gherkin
@playlists
Feature: Playlist Landing page

  Background:
    Given there is a playlist prepared called "Test Playlist"
    And the user clicks on "Playlists" in navigation menu

  Scenario: Playlist exists
    Then there should be playlist with name "Test Playlist"
```

**`tests/selectors/main/playlist-landing.selectors.ts`**
```typescript
export class PlaylistLandingSelectors {
  static readonly CARD = '.grid-content .grid-item';
  static readonly CARD_WITH_TEXT = (title: string) =>
    `${this.CARD}:has-text("${title}")`;
}
```

**`tests/pages/main/playlist-landing.page.ts`**
```typescript
import { BaseMainPage } from '../_base/base-main.page';
import { TestContext } from '../../context/context';
import { Locator } from 'playwright';
import { PlaylistLandingSelectors } from '../../selectors/main/playlist-landing.selectors';

export class PlaylistLandingPage extends BaseMainPage {
  constructor(protected context: TestContext) {
    super(context);
  }

  getPlaylistCard(playlistName: string): Locator {
    return this.page
      .locator(PlaylistLandingSelectors.CARD_WITH_TEXT(playlistName))
      .first();
  }
}
```

**`tests/steps/main/playlist.steps.ts`**
```typescript
import { binding, given, then } from 'cucumber-tsflow';
import { TestContext } from '../../context/context';
import { BaseSteps } from '../base.steps';
import { PlaylistLandingPage } from '../../pages/main/playlist-landing.page';
import { createPlaylist } from '../../apis/playlists.api';
import { expect } from 'playwright/test';

@binding([TestContext])
export class PlaylistSteps extends BaseSteps {
  private page: PlaylistLandingPage;

  constructor(protected context: TestContext) {
    super(context);
    this.page = new PlaylistLandingPage(context);
  }

  @given('there is a playlist prepared called {string}')
  async preparePlaylist(playlistName: string): Promise<void> {
    await createPlaylist(this.page.page, { name: playlistName, tags: [] });
  }

  @then('there should be playlist with name {string}')
  async playlistIsOnLandingPage(playlistName: string): Promise<void> {
    await expect(this.page.getPlaylistCard(playlistName)).toBeVisible();
  }
}
```
