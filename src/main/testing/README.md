# Testing Utilities Quick Reference

## One-Liner Setup (Copy-Paste Ready)

### For Managers with ViewManager Dependency
```typescript
import { setupManagerWithViewManagerDependency, setupManagerTestEnvironment } from '../testing/setup';

setupManagerWithViewManagerDependency();

describe('YourManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

### For Managers with Database Dependency
```typescript
import { setupManagerWithDatabaseDependency, setupManagerTestEnvironment } from '../testing/setup';

setupManagerWithDatabaseDependency();

describe('YourManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

### For Complex Managers with Multiple Dependencies
```typescript
import { setupManagerWithMultipleDependencies, setupManagerTestEnvironment } from '../testing/setup';

setupManagerWithMultipleDependencies();

describe('YourManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

---

## Centralized Mocks & Data Factories (Summary)

Use shared mock objects & factory functions from: `src/main/testing/mocks/`

Full authoring rules: `src/main/testing/mocks/README.md`
Detailed guide: `src/main/testing/MOCKING_GUIDE.md`
Electron test patterns: `.github/instructions/electron_test.instructions.md`
Utilities reference: `.github/instructions/testing_utilities.md`

### Naming Conventions
- Module/object mocks: `mock-[entity].ts` exporting `const mockX = { ... }`
- Data factories: `[type].data.ts` exporting `mock[PascalType](overrides?)`

### Defaults Cheat Sheet
- Arrays → `[]`
- Strings → `uuid().slice(0,6)` or semantic literal
- Numbers → `Math.ceil(Math.random()*X)`
- Objects → `{}` or `null` if allowed
- Dates → `new Date()`

### Example Usage
```ts
import { mockElectron } from '../testing/mocks/mock-electron';
vi.mock('electron', () => mockElectron);

import { mockIpcMainEvent } from '../testing/mocks/ipc-main-event.data';
const evt = mockIpcMainEvent({ processId: 99 });
```
> Add new reusable mocks under `mocks/` instead of duplicating inline literals.

---

## Common Imports

```typescript
import {
  setupManagerWithViewManagerDependency,    // Electron + ViewManager
  setupManagerWithDatabaseDependency,       // Electron + Database
  setupManagerWithMultipleDependencies,     // Everything
  setupManagerTestEnvironment,              // Clean mocks (use in beforeEach)
  createMockViewManager,                    // Mock ViewManager instance
  createMockDatabase,                       // Mock Database instance
  createMockIpcEvent,                       // Mock IPC event
  getRegisteredIpcHandler,                  // Get IPC handler by channel
} from '../testing/setup';
```

---

## Manager Detection Guide

**Does your manager use ViewManager?**
→ Use `setupManagerWithViewManagerDependency()`

**Does your manager use DatabaseWrapper?**
→ Use `setupManagerWithDatabaseDependency()`

**Does your manager use both + other services?**
→ Use `setupManagerWithMultipleDependencies()`

**Does your manager use specific custom dependencies?**
→ Mix and match individual `mock*()` functions

---

## Your Updated Test (RedirectManager)

Before:
```typescript
// 20+ lines of repetitive mock setup
vi.mock('electron', () => ({ ... }));
vi.mock('./view.manager', () => ({ ... }));
```

After:
```typescript
import { setupManagerWithViewManagerDependency } from '../testing/setup';

setupManagerWithViewManagerDependency();
// Done! ✅
```

**Result:** RedirectManager test now has:
- ✅ Cleaner, more readable setup
- ✅ Reusable utilities for other managers
- ✅ Consistent mocking patterns
- ✅ Built-in IPC testing helpers

---

## Next: Create Tests for Other Managers

### TrackManager
```typescript
import { setupManagerWithDatabaseDependency, setupManagerTestEnvironment } from '../testing/setup';

setupManagerWithDatabaseDependency();

describe('TrackManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

### FilesManager
```typescript
import { mockElectronAPIs, mockFileSystem, setupManagerTestEnvironment } from '../testing/setup';

mockElectronAPIs();
mockFileSystem();

describe('FilesManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

### DiscordManager
```typescript
import { setupManagerWithMultipleDependencies, setupManagerTestEnvironment } from '../testing/setup';

setupManagerWithMultipleDependencies();

describe('DiscordManager', () => {
  beforeEach(() => setupManagerTestEnvironment());
  // ... tests
});
```

---

## File Structure

```
src/main/testing/
├── setup.ts                    ✅ Reusable utilities
├── MOCKING_GUIDE.md            🔗 Expanded mocks + utilities guide
├── README.md                   🔗 Quick reference (this file)
└── mocks/                      ✅ Centralized mock objects & factories
    ├── README.md               🔗 Authoring rules
    ├── mock-electron.ts        (example)
    ├── ipc-main-event.data.ts  (example factory)
```

Related instruction files:
```
.github/instructions/
├── electron_test.instructions.md    🔗 Backend testing patterns
├── testing_utilities.md             🔗 Utility functions deep dive
└── unit_test.instructions.md        🔗 Frontend (Angular) testing guide
```

---

## Run Your Tests

```bash
# Watch mode (recommended during development)
npm run test:electron:watch

# Run once
npm run test:electron

# Run specific test file
npm run test:electron src/main/managers/redirect.manager.spec.ts
```

---

## Example: Full RedirectManager Test with Utilities

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

// ✅ One line replaces 15+ lines of mock setup!
setupManagerWithViewManagerDependency();

describe('RedirectManager', () => {
  beforeEach(() => {
    setupManagerTestEnvironment();
    vi.resetModules();
  });

  describe('getInstance', () => {
    it('should create instance and register channels', async () => {
      const manager = await RedirectManager.getInstance();
      expect(manager).toBeTruthy();
      expect(ipcMain.on).toHaveBeenCalledWith(
        GeneralChannels.REDIRECT,
        expect.any(Function)
      );
    });
  });

  describe('broadcast events', () => {
    it('should broadcast to ViewManager', async () => {
      const mockViewManager = createMockViewManager();
      
      const ViewManagerModule = await import('./view.manager');
      vi.mocked(ViewManagerModule.ViewManager.getInstance).mockResolvedValue(
        mockViewManager as any
      );

      await RedirectManager.getInstance();

      const handler = getRegisteredIpcHandler(GeneralChannels.REDIRECT, ipcMain.on);
      if (handler) {
        handler(createMockIpcEvent(456), 'test-path');
        
        expect(mockViewManager.broadcast).toHaveBeenCalledWith(
          GeneralChannels.REDIRECT,
          456,
          'test-path'
        );
      }
    });
  });
});
```

---

## Key Takeaway

✅ Instead of copying mock setup code into every test file, use the reusable utilities from `src/main/testing/setup.ts`
✅ One import + one function call = full mock environment
✅ Centralize new mocks under `mocks/` and keep the rules updated in `mocks/README.md`
✅ Read extended guidance: `src/main/testing/MOCKING_GUIDE.md`

**You're ready to write manager tests efficiently.** 🚀
