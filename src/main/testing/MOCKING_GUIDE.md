# Using Reusable Mock Functions from setup.ts

## Overview

The `src/main/testing/setup.ts` file now contains reusable mock configuration getters and helper functions for testing Electron managers. While `vi.mock()` calls must stay inline in test files (due to hoisting requirements), you can use the utility functions in `setup.ts` for:

1. Creating mock instances for testing interactions
2. Clearing mocks between tests
3. Simulating IPC events
4. Creating mock data objects

## 🔗 Related Mocking Resources
- Authoring rules & object/data factory conventions: `src/main/testing/mocks/README.md`
- Centralized mock object files: `src/main/testing/mocks/`
- High-level backend testing guide: `.github/instructions/electron_test.instructions.md`
- Utility setup quick reference: `.github/instructions/testing_utilities.md`
- Quick start shortcuts: `src/main/testing/README.md`

## Mock Object & Data Factory Conventions (Summary)
Borrowed from `mocks/README.md` (do not duplicate—update source file if rules change):
- Module/object mocks: `mock-[entity-name].ts` exporting a `const` mock object
- Data factories: `[type-name].data.ts` exporting `mock[PascalType]()` function
- Defaults: arrays `[]`, strings short `uuid().slice(0,6)`, numbers `Math.ceil(Math.random()*X)`, objects `{}`/`null`, dates `new Date()`
- All functions created with `vi.fn()`; never use `any`—always strict types.

Example module mock usage:
```ts
import { mockElectron } from '../testing/mocks/mock-electron';
vi.mock('electron', () => mockElectron);
```
Example data factory:
```ts
import { mockIpcMainEvent } from '../testing/mocks/ipc-main-event.data';
const evt = mockIpcMainEvent({ processId: 42 });
```

> Always add new shared mocks under `src/main/testing/mocks/` rather than repeating inline shapes in multiple spec files.

## Available Functions in setup.ts

### Mock Configuration Getters (Reference Only)
These return mock configurations and are documented in `setup.ts` for reference:
- `getElectronAPIMocks()` - Electron API mock configuration
- `getViewManagerMocks()` - ViewManager mock configuration
- `getDatabaseMocks()` - DatabaseWrapper mock configuration
- `getFileSystemMocks()` - File system mock configuration
- `getDiscordJSMocks()` - Discord.js mock configuration
- `getMusicMetadataMocks()` - music-metadata mock configuration

### Mock Setup Functions
For cleanup and test environment setup:
- `setupManagerTestEnvironment()` - Clear all mocks between tests

### Mock Instance Creators
For creating properly-typed mock objects:
- `createMockViewManager()` - Create a ViewManager mock with all methods as spies
- `createMockDatabase()` - Create a DatabaseWrapper mock with all methods as spies
- `createMockIpcEvent(processId?)` - Create a mock IPC event object

### IPC Handler Utilities
For testing IPC handlers:
- `getRegisteredIpcHandler(channel, from?)` - Get a registered IPC handler by channel
- `triggerIpcHandler(channel, data, processId?)` - Manually trigger an IPC handler

## Pattern: Creating Tests for Other Managers

### Step 1: Add vi.mock() Calls to Test File
Copy the mock definitions inline in your test file at the top level:

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ✅ Mock ViewManager BEFORE importing the manager
vi.mock('./view.manager', () => ({
  ViewManager: {
    getInstance: vi.fn(async () => ({
      broadcast: vi.fn(),
      createWindow: vi.fn(),
      getWindow: vi.fn(),
    })),
  },
}));

// ✅ Mock Electron APIs
vi.mock('electron', () => ({
  app: { on: vi.fn(), quit: vi.fn(), ... },
  ipcMain: { handle: vi.fn(), on: vi.fn(), ... },
  // ... etc
}));

// Now import after mocks
import { YourManager } from './your.manager';
import { setupManagerTestEnvironment } from '../testing/setup';
```

### Step 2: Use setupManagerTestEnvironment() in beforeEach
```typescript
describe('YourManager', () => {
  beforeEach(() => {
    setupManagerTestEnvironment();  // Clear mocks between tests
    vi.resetModules();              // Reset singletons
  });
  
  // Your tests...
});
```

### Step 3: Use Creator Functions When Needed
```typescript
import { createMockViewManager, createMockIpcEvent } from '../testing/setup';

describe('YourManager', () => {
  it('should interact with ViewManager', async () => {
    const mockViewManager = createMockViewManager();
    
    // Test code...
    
    expect(mockViewManager.broadcast).toHaveBeenCalled();
  });
});
```

## Complete Example: TrackManager Test

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Track } from '@shared/models/track.model';

// ✅ Mock Electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

// ✅ Mock Database
vi.mock('../database/database', () => ({
  DatabaseWrapper: {
    getInstance: vi.fn(async () => ({
      readTable: vi.fn(),
      updateTable: vi.fn(),
    })),
  },
}));

// Import after mocks
import { TrackManager } from './track.manager';
import { ipcMain } from 'electron';
import { setupManagerTestEnvironment, createMockDatabase } from '../testing/setup';

describe('TrackManager', () => {
  let manager: TrackManager;
  let mockDatabase: any;
  let mockTrack: Track;

  beforeEach(() => {
    setupManagerTestEnvironment();
    vi.resetModules();
    
    // Create mock data with full type safety
    mockTrack = {
      id: 'track-1',
      name: 'Test Track',
      url: '/test.mp3',
      duration: 180,
      author: 'Test Artist',
    } as Track;
    
    mockDatabase = createMockDatabase();
  });

  it('should initialize and register IPC handlers', async () => {
    manager = await TrackManager.getInstance();
    
    expect(manager).toBeTruthy();
    expect(ipcMain.handle).toHaveBeenCalled();
  });

  it('should get all tracks', () => {
    mockDatabase.readTable.mockReturnValue([mockTrack]);
    const result = manager.getAll();
    
    expect(result).toEqual([mockTrack]);
  });
});
```

## Files Involved

| File | Purpose |
|------|---------|
| `src/main/testing/setup.ts` | Reusable utility functions |
| `src/main/testing/mocks/README.md` | Canonical mock authoring rules |
| `src/main/testing/mocks/*` | Centralized mock objects & factories |
| `src/main/managers/*.spec.ts` | Individual manager test files with inline `vi.mock()` |
| `.github/instructions/electron_test.instructions.md` | Full backend testing patterns |
| `.github/instructions/testing_utilities.md` | Detailed utilities guide |

## Key Points

✅ **DO:**
- Copy `vi.mock()` definitions inline in test files (required for hoisting)
- Use `setupManagerTestEnvironment()` in `beforeEach`
- Use creator functions like `createMockViewManager()` when testing interactions
- Place reusable mock objects in `mocks/` folder
- Keep `mocks/README.md` updated when adding new patterns

❌ **DON'T:**
- Call `vi.mock()` from imported helper functions (hoisting breaks)
- Duplicate large mock object literals across multiple tests
- Forget to clear mocks / reset modules for singleton patterns
- Use `any` for mock data types

## Future Additions

If you create a new mock pattern that gets reused across multiple tests, add it as a getter function or creator function to `setup.ts` and (if broadly reusable) a shared object/factory file under `mocks/`.

```typescript
// Add to setup.ts
export function createMockCustomService() {
  return {
    method1: vi.fn(),
    method2: vi.fn(),
  };
}
```

Add reusable object form (if needed across suites):
```typescript
// src/main/testing/mocks/mock-custom-service.ts
export const mockCustomService = {
  method1: vi.fn(),
  method2: vi.fn(),
};
```

Then use it in tests:
```typescript
import { createMockCustomService } from '../testing/setup';

it('should use custom service', () => {
  const mock = createMockCustomService();
  // Your test...
});
```

This keeps test files lean and mock definitions centralized. 🧪
