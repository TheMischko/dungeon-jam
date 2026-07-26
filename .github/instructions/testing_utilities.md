---
applyTo: "src/**/*.spec.ts"
---

# Testing Utilities Guide for Electron Managers

## Overview

The `src/main/testing/setup.ts` file provides reusable mock setup functions and utilities for testing Electron managers. This eliminates boilerplate and ensures consistency across all manager tests.

**Location**: `src/main/testing/setup.ts`

**Key Benefits:**
- ✅ Reusable mock functions (no repetition)
- ✅ Consistent mocking patterns across all tests
- ✅ Avoids cascading initialization issues
- ✅ Reduces test file size and complexity
- ✅ Makes it easy to test managers with dependencies

---

## Quick Start

### Before (Without Utilities)
```typescript
import { vi } from 'vitest';

// Repetitive mock setup in every test file
vi.mock('electron', () => ({
  ipcMain: { on: vi.fn(), handle: vi.fn() },
}));

vi.mock('./view.manager', () => ({
  ViewManager: {
    getInstance: vi.fn().mockResolvedValue({
      broadcast: vi.fn(),
    }),
  },
}));

describe('MyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  // ... test code
});
```

### After (With Utilities)
```typescript
import { setupManagerWithViewManagerDependency, setupManagerTestEnvironment } from '../testing/setup';

// One line setup!
setupManagerWithViewManagerDependency();

describe('MyManager', () => {
  beforeEach(() => {
    setupManagerTestEnvironment();
  });
  // ... test code
});
```

---

## Available Setup Functions

### 1. `mockElectronAPIs()`
Mocks core Electron APIs: `app`, `ipcMain`, `BrowserWindow`, `WebContentsView`

**Use when:** Testing any manager that uses Electron APIs

```typescript
import { mockElectronAPIs } from '../testing/setup';

mockElectronAPIs();

describe('MyManager', () => {
  // Now all Electron APIs are mocked
  it('should use ipcMain', () => {
    expect(ipcMain.on).toBeDefined();
  });
});
```

### 2. `mockViewManager()`
Mocks `ViewManager` to prevent `BrowserWindow` creation

**Use when:** Testing managers that depend on ViewManager

```typescript
import { mockViewManager } from '../testing/setup';

mockViewManager();

describe('RedirectManager', () => {
  it('should use ViewManager without creating real windows', async () => {
    const manager = await RedirectManager.getInstance();
    expect(manager).toBeTruthy();
  });
});
```

### 3. `mockDatabase()`
Mocks `DatabaseWrapper` for isolation

**Use when:** Testing managers that use the database

```typescript
import { mockDatabase } from '../testing/setup';

mockDatabase();

describe('TrackManager', () => {
  it('should access database without file I/O', () => {
    // Database operations are mocked
  });
});
```

### 4. `mockFileSystem()`
Mocks Node.js file system operations

**Use when:** Testing file operations without real disk I/O

```typescript
import { mockFileSystem } from '../testing/setup';

mockFileSystem();

describe('FilesManager', () => {
  it('should read files without touching disk', async () => {
    // fs operations are mocked
  });
});
```

### 5. `mockDiscordJS()`
Mocks Discord.js Client

**Use when:** Testing Discord-related managers

```typescript
import { mockDiscordJS } from '../testing/setup';

mockDiscordJS();

describe('DiscordManager', () => {
  it('should initialize Discord client', async () => {
    // No real Discord connection
  });
});
```

### 6. `mockMusicMetadata()`
Mocks music metadata parsing

**Use when:** Testing audio file metadata extraction

```typescript
import { mockMusicMetadata } from '../testing/setup';

mockMusicMetadata();

describe('FilesManager', () => {
  it('should parse metadata', async () => {
    // Metadata parsing is mocked
  });
});
```

---

## Convenience Setup Functions

These combine multiple mocks for common scenarios:

### `setupManagerWithViewManagerDependency()`
Mocks Electron + ViewManager

**Use for:** RedirectManager, any manager needing ViewManager

```typescript
import { setupManagerWithViewManagerDependency } from '../testing/setup';

setupManagerWithViewManagerDependency();

describe('RedirectManager', () => {
  // Both Electron and ViewManager are mocked
});
```

### `setupManagerWithDatabaseDependency()`
Mocks Electron + DatabaseWrapper

**Use for:** TrackManager, any manager needing database

```typescript
import { setupManagerWithDatabaseDependency } from '../testing/setup';

setupManagerWithDatabaseDependency();

describe('TrackManager', () => {
  // Both Electron and Database are mocked
});
```

### `setupManagerWithMultipleDependencies()`
Mocks Electron + ViewManager + Database + FileSystem + Discord.js

**Use for:** Complex managers with multiple dependencies

```typescript
import { setupManagerWithMultipleDependencies } from '../testing/setup';

setupManagerWithMultipleDependencies();

describe('ComplexManager', () => {
  // All common dependencies are mocked
});
```

### `setupManagerTestEnvironment()`
Clears mocks for test isolation

**Use in:** `beforeEach()` for every test

```typescript
beforeEach(() => {
  setupManagerTestEnvironment();
});
```

---

## Mock Factory Functions

These create properly-typed mock objects:

### `createMockViewManager()`
Creates a mock ViewManager with all methods as spies

```typescript
import { createMockViewManager } from '../testing/setup';

const mockViewManager = createMockViewManager();
// Returns: { broadcast: vi.fn(), createWindow: vi.fn(), ... }

expect(mockViewManager.broadcast).toHaveBeenCalled();
```

### `createMockDatabase()`
Creates a mock DatabaseWrapper with all methods as spies

```typescript
import { createMockDatabase } from '../testing/setup';

const mockDatabase = createMockDatabase();
// Returns: { readTable: vi.fn(), updateTable: vi.fn(), ... }

expect(mockDatabase.readTable).toHaveBeenCalledWith('tracks');
```

### `createMockIpcEvent(processId?)`
Creates a mock Electron IPC event

```typescript
import { createMockIpcEvent } from '../testing/setup';

const mockEvent = createMockIpcEvent(123);
// Returns: { processId: 123, sender: { send: vi.fn() } }
```

---

## IPC Handler Utilities

### `getRegisteredIpcHandler(channel, from?)`
Retrieves a registered IPC handler by channel name

**Use when:** Testing IPC event handlers

```typescript
import { getRegisteredIpcHandler } from '../testing/setup';
import { ipcMain } from 'electron';

await MyManager.getInstance();

const handler = getRegisteredIpcHandler('my-channel', ipcMain.on);
expect(handler).toBeDefined();
```

### `triggerIpcHandler(channel, data, processId?)`
Manually triggers a registered IPC handler

**Use when:** Simulating IPC events in tests

```typescript
import { triggerIpcHandler, getRegisteredIpcHandler } from '../testing/setup';

const handler = getRegisteredIpcHandler('REDIRECT', ipcMain.on);
if (handler) {
  handler(createMockIpcEvent(456), 'test-path');
  expect(/* assertions */);
}
```

---

## Complete Example: RedirectManager Test

Here's how to use the utilities together:

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedirectManager } from './redirect.manager';
import { ipcMain } from 'electron';
import { GeneralChannels } from '@shared/models/channels.model';
import {
  setupManagerWithViewManagerDependency,
  setupManagerTestEnvironment,
  createMockViewManager,
  createMockIpcEvent,
  getRegisteredIpcHandler,
} from '../testing/setup';

// ✅ Setup mocks FIRST (single line!)
setupManagerWithViewManagerDependency();

describe('RedirectManager', () => {
  beforeEach(() => {
    // ✅ Clean mocks before each test
    setupManagerTestEnvironment();
    vi.resetModules();
  });

  describe('getInstance', () => {
    it('should create a new instance and register channels', async () => {
      const redirectManager = await RedirectManager.getInstance();

      expect(redirectManager).toBeTruthy();
      expect(ipcMain.on).toHaveBeenCalledWith(
        GeneralChannels.REDIRECT,
        expect.any(Function)
      );
    });

    it('should reuse the same instance if called multiple times', async () => {
      const instanceA = await RedirectManager.getInstance();
      const instanceB = await RedirectManager.getInstance();

      expect(instanceA).toBe(instanceB);
    });
  });

  describe('redirect event handling', () => {
    it('should broadcast redirect events to ViewManager', async () => {
      const mockViewManager = createMockViewManager();

      const ViewManagerModule = await import('./view.manager');
      vi.mocked(ViewManagerModule.ViewManager.getInstance).mockResolvedValue(
        mockViewManager as any
      );

      await RedirectManager.getInstance();

      // ✅ Use utility to get handler
      const handler = getRegisteredIpcHandler(GeneralChannels.REDIRECT, ipcMain.on);
      expect(handler).toBeDefined();

      if (handler) {
        // ✅ Use utility to create mock event
        const mockEvent = createMockIpcEvent(456);
        const testPath = 'test-redirect-path';

        handler(mockEvent, testPath);

        expect(mockViewManager.broadcast).toHaveBeenCalledWith(
          GeneralChannels.REDIRECT,
          456,
          testPath
        );
      }
    });
  });
});
```

---

## Pattern Guide: When to Use What

### Manager with ViewManager Dependency
```typescript
import { setupManagerWithViewManagerDependency } from '../testing/setup';

setupManagerWithViewManagerDependency();

describe('YourManager', () => {
  // ViewManager and Electron are mocked
});
```

### Manager with Database Dependency
```typescript
import { setupManagerWithDatabaseDependency } from '../testing/setup';

setupManagerWithDatabaseDependency();

describe('YourManager', () => {
  // Database and Electron are mocked
});
```

### Manager with Multiple Dependencies
```typescript
import { setupManagerWithMultipleDependencies } from '../testing/setup';

setupManagerWithMultipleDependencies();

describe('YourManager', () => {
  // All common dependencies are mocked
});
```

### Manager with Specific File System Operations
```typescript
import { mockElectronAPIs, mockFileSystem } from '../testing/setup';

mockElectronAPIs();
mockFileSystem();

describe('YourManager', () => {
  // Electron and FS are mocked
});
```

---

## Common Test Patterns

### Testing IPC Handler Registration

```typescript
import { getRegisteredIpcHandler } from '../testing/setup';

it('should register IPC handler', async () => {
  await MyManager.getInstance();

  const handler = getRegisteredIpcHandler('my-channel', ipcMain.on);
  expect(handler).toBeDefined();
});
```

### Testing IPC Event Handling

```typescript
import { getRegisteredIpcHandler, createMockIpcEvent } from '../testing/setup';

it('should handle IPC events', async () => {
  const mockService = createMockService();
  await MyManager.getInstance();

  const handler = getRegisteredIpcHandler('my-channel', ipcMain.on);
  if (handler) {
    handler(createMockIpcEvent(123), eventData);
    expect(mockService.method).toHaveBeenCalled();
  }
});
```

### Testing with Mock Service Interactions

```typescript
import { createMockViewManager } from '../testing/setup';

it('should call ViewManager', async () => {
  const mockViewManager = createMockViewManager();
  
  // Override the mock
  vi.mocked(ViewManager.getInstance).mockResolvedValue(mockViewManager as any);
  
  await MyManager.getInstance();
  
  expect(mockViewManager.broadcast).toHaveBeenCalled();
});
```

---

## Benefits Over Manual Mocking

| Aspect | Manual | With Utilities |
|--------|--------|----------------|
| Lines of setup code | 15-20 | 1-2 |
| Consistency | Must be careful | Guaranteed |
| Reusability | Copy-paste | Import function |
| Maintenance | Update each file | Update once |
| Readability | Verbose | Clear intent |
| Error prone | Yes | No |

---

## Best Practices

✅ **DO:**
- Use setup functions at the top of the describe block
- Call `setupManagerTestEnvironment()` in every `beforeEach`
- Use factory functions when you need to spy on interactions
- Use convenience functions for common scenarios
- Import utilities from `../testing/setup`

❌ **DON'T:**
- Mix manual `vi.mock()` with setup functions
- Forget to call `setupManagerTestEnvironment()` in `beforeEach`
- Create custom mock setup instead of using utilities
- Copy mock setup code between tests

---

## Adding New Setup Functions

If you find yourself repeating a pattern, add it to `src/main/testing/setup.ts`:

```typescript
/**
 * Setup for managers that depend on [NewDependency]
 */
export function setupManagerWith[NewDependency]Dependency(): void {
  mockElectronAPIs();
  mockNewDependency();
}

/**
 * Create a mock [NewDependency] instance
 */
export function createMock[NewDependency]() {
  return {
    method1: vi.fn(),
    method2: vi.fn(),
  };
}
```

Then use it in your tests:

```typescript
import { setupManagerWithNewDependencyDependency } from '../testing/setup';

setupManagerWithNewDependencyDependency();

describe('MyManager', () => {
  // All mocks setup automatically
});
```

---

## Reference: All Available Utilities

### Setup Functions
- `mockElectronAPIs()` - Mock Electron core APIs
- `mockViewManager()` - Mock ViewManager
- `mockDatabase()` - Mock DatabaseWrapper
- `mockFileSystem()` - Mock fs operations
- `mockDiscordJS()` - Mock Discord.js
- `mockMusicMetadata()` - Mock music-metadata
- `setupManagerWithViewManagerDependency()` - Electron + ViewManager
- `setupManagerWithDatabaseDependency()` - Electron + Database
- `setupManagerWithMultipleDependencies()` - All common mocks
- `setupManagerTestEnvironment()` - Clear mocks between tests

### Factory Functions
- `createMockViewManager()` - Create ViewManager mock
- `createMockDatabase()` - Create DatabaseWrapper mock
- `createMockIpcEvent(processId?)` - Create IPC event mock

### Handler Utilities
- `getRegisteredIpcHandler(channel, from?)` - Get IPC handler
- `triggerIpcHandler(channel, data, processId?)` - Trigger IPC handler

---

## Troubleshooting

**Q: "Cannot find module 'electron'"**
- Make sure to call setup function before describe block
- Ensure `mockElectronAPIs()` is included in your setup

**Q: "ViewManager real instance is being created"**
- You need to call `setupManagerWithViewManagerDependency()`
- Or explicitly call `mockViewManager()`

**Q: "Mock not working as expected"**
- Verify setup function is called at the top of the file
- Check that `setupManagerTestEnvironment()` is in `beforeEach`
- Use `vi.clearAllMocks()` if needed

---

## Next Steps

1. Check your manager's dependencies
2. Choose appropriate setup function from this guide
3. Copy the setup into your test file
4. Add to `beforeEach`: `setupManagerTestEnvironment()`
5. Use factory functions to create mocks when needed
6. Run tests: `npm run test:electron:watch`

Happy testing! 🎉

