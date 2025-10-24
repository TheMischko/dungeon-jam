---
applyTo: "src/**/*.spec.ts"
---

# Electron Backend Unit Testing Instructions for Dungeon Jam

## Overview

This repository uses **Vitest 2.x** with **TypeScript** for unit testing the Electron backend. Vitest was chosen over Karma/Jasmine because:

- ✅ **Designed for Node.js**: Better support for backend/Electron code than Karma (which is frontend-focused)
- ✅ **Familiar API**: Same syntax as Jasmine, easy transition from frontend tests
- ✅ **Unified Test Command**: Can run Angular (Karma) + Electron (Vitest) tests with one command
- ✅ **Superior Mocking**: Built-in mocking for Node modules, Electron APIs, and file system operations
- ✅ **Fast Execution**: Significantly faster than Karma for backend tests
- ✅ **Watch Mode**: Hot-reload tests during development

**Primary Commands:**
```bash
npm run test:electron          # Run Electron tests once
npm run test:electron:watch    # Run Electron tests in watch mode
npm run test                   # Run ALL tests (Angular + Electron)
npm run test:coverage          # Generate coverage for both frontend and backend
```

---

## Test File Structure & Setup

### Backend Service/Manager Tests

Managers and services should follow this structure with mocks setup in `beforeEach`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackManager } from './track.manager';
import { DatabaseWrapper } from '../database/database';
import { Track } from '@shared/models/track.model';

describe('TrackManager', () => {
  let manager: TrackManager;
  let mockDatabase: any;
  let mockTrack: Track;

  beforeEach(() => {
    // ✅ Create mock database with proper typing
    mockDatabase = {
      readTable: vi.fn(),
      updateTable: vi.fn(),
    };

    // ✅ Define mock data FIRST with full type safety
    mockTrack = {
      id: 'track-1',
      name: 'Test Track',
      url: '/test.mp3',
      duration: 180,
      author: 'Test Artist'
    } as Track;

    // ✅ Create manager instance (or inject mock dependencies)
    manager = new TrackManager(mockDatabase);
  });

  describe('getAll', () => {
    it('should return all tracks', () => {
      const mockTracks = [mockTrack];
      mockDatabase.readTable.mockReturnValue(mockTracks);

      const result = manager.getAll();
      
      expect(result).toEqual(mockTracks);
      expect(mockDatabase.readTable).toHaveBeenCalledWith('tracks');
    });

    it('should return empty array when no tracks exist', () => {
      mockDatabase.readTable.mockReturnValue([]);

      const result = manager.getAll();
      
      expect(result).toEqual([]);
    });
  });
});
```

### Database Tests

For testing database operations with file system isolation:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseWrapper } from './database';
import * as fs from 'node:fs';

describe('DatabaseWrapper', () => {
  let database: DatabaseWrapper;
  const testDbPath = './test-db.json';

  beforeEach(async () => {
    // ✅ Use isolated test database file
    vi.mock('./database.ts', () => ({
      DB_FILE: testDbPath
    }));
    database = await DatabaseWrapper.getInstance();
  });

  afterEach(() => {
    // ✅ Cleanup test database after each test
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    vi.resetModules();
  });

  it('should read table', () => {
    const result = database.readTable<any[]>('tracks');
    expect(result).toBeTruthy();
  });
});
```

### Electron API Mock Tests

For testing IPC handlers and Electron integration:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ipcMain } from 'electron';
import { setupTrackHandlers } from './track-handlers';

// ✅ Mock Electron ipcMain
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  }
}));

describe('Track IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupTrackHandlers();
  });

  it('should register getTracks handler', () => {
    expect(ipcMain.handle).toHaveBeenCalledWith(
      expect.stringContaining('getTracks'),
      expect.any(Function)
    );
  });
});
```

---

## Mock Data & Spy Setup

### ✅ DO: Use `vi.fn()` for Mocking Functions

Use Vitest's `vi.fn()` (instead of Jasmine's `spyOn`) for creating mocks:

```typescript
import { vi } from 'vitest';

let mockDatabase: any;

beforeEach(() => {
  // ✅ CORRECT - Use vi.fn() for mocks
  mockDatabase = {
    readTable: vi.fn().mockReturnValue([mockTrack]),
    updateTable: vi.fn().mockResolvedValue(undefined),
    deleteTable: vi.fn().mockRejectedValue(new Error('Not found'))
  };
});

it('should call database methods', () => {
  manager.getTrack('id-1');
  
  expect(mockDatabase.readTable).toHaveBeenCalledWith('tracks');
  expect(mockDatabase.readTable).toHaveBeenCalledTimes(1);
});
```

### ✅ DO: Mock Electron APIs

Always mock Electron APIs—never test with real Electron windows:

```typescript
import { vi } from 'vitest';

// ✅ Mock entire Electron module
vi.mock('electron', () => ({
  app: {
    on: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    send: vi.fn(),
  },
  BrowserWindow: vi.fn(() => ({
    loadURL: vi.fn(),
    webContents: {
      send: vi.fn(),
    },
  })),
}));

// ✅ Mock file system
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

// ✅ Mock external services
vi.mock('discord.js', () => ({
  Client: vi.fn(() => ({
    login: vi.fn(),
    destroy: vi.fn(),
  })),
}));
```

### ✅ DO: Use Strict Data Typing (Never Use `any`)

Always declare mock data with proper TypeScript types:

```typescript
import { Track, AudioTrack } from '@shared/models/track.model';

let mockTrack: Track;
let mockAudioTrack: AudioTrack;

beforeEach(() => {
  // ✅ CORRECT - Full data model with proper typing
  mockTrack = {
    id: 'track-1',
    name: 'Song Title',
    url: '/path/to/song.mp3',
    author: 'Artist Name',
    duration: 240
  } as Track;

  mockAudioTrack = {
    title: 'Song Title',
    fullPath: '/absolute/path/song.mp3',
    author: 'Artist Name',
    length: 240
  } as AudioTrack;
});

// ❌ WRONG - Using `any` is not allowed
const mockDataAny: any = { id: 'test' };  // ❌ Never do this
```

**Create mock factory functions for complex data:**

```typescript
function createMockTrack(overrides?: Partial<Track>): Track {
  return {
    id: 'track-1',
    name: 'Default Track',
    url: '/default.mp3',
    duration: 180,
    author: 'Default Artist',
    ...overrides
  } as Track;
}

beforeEach(() => {
  // ✅ Use factory with full type safety
  mockTrack = createMockTrack();
  mockTrackShort = createMockTrack({ duration: 60 });
});
```

---

## Describe Block Organization

### ✅ DO: Group Related Tests with `describe` Blocks

Use nested `describe` blocks to organize tests by functionality:

```typescript
describe('TrackManager', () => {
  let manager: TrackManager;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = { readTable: vi.fn() };
    manager = new TrackManager(mockDatabase);
  });

  // ✅ Group all tests for getTrack
  describe('getTrack', () => {
    it('should return track when id exists', () => {
      mockDatabase.readTable.mockReturnValue([mockTrack]);
      const result = manager.getTrack('track-1');
      expect(result).toEqual(mockTrack);
    });

    it('should return null when track not found', () => {
      mockDatabase.readTable.mockReturnValue([]);
      const result = manager.getTrack('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw error when database fails', () => {
      mockDatabase.readTable.mockImplementation(() => {
        throw new Error('DB Error');
      });
      expect(() => manager.getTrack('id')).toThrow('DB Error');
    });
  });

  // ✅ Group all tests for insertTrack
  describe('insertTrack', () => {
    it('should add track to database', async () => {
      await manager.insertTrack(mockTrack);
      expect(mockDatabase.updateTable).toHaveBeenCalled();
    });

    it('should validate track data before insert', async () => {
      const invalidTrack = { ...mockTrack, name: '' };
      await expect(manager.insertTrack(invalidTrack)).rejects.toThrow();
    });
  });
});
```

### ❌ DON'T: Over-Use `describe` for Single Simple Tests

Skip `describe` for simple functions with one test case:

```typescript
// ❌ OVER-COMPLICATED - Unnecessary describe
describe('getTrackCount', () => {
  it('should return the number of tracks', () => {
    expect(manager.getTrackCount()).toBe(1);
  });
});

// ✅ CORRECT - Direct test for simple function
it('should return the number of tracks', () => {
  expect(manager.getTrackCount()).toBe(1);
});
```

---

## Testing Patterns

### Testing Async/Promise-Based Code

Use `async/await` in tests for promise returns:

```typescript
it('should save track to database', async () => {
  const result = await manager.saveTrack(mockTrack);
  
  expect(result).toEqual(mockTrack);
  expect(mockDatabase.updateTable).toHaveBeenCalled();
});

it('should handle database errors', async () => {
  mockDatabase.updateTable.mockRejectedValue(new Error('DB failed'));
  
  await expect(manager.saveTrack(mockTrack)).rejects.toThrow('DB failed');
});
```

### Testing File System Operations

Mock file system to avoid real file I/O:

```typescript
import { vi } from 'vitest';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('FilesManager', () => {
  let manager: FilesManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new FilesManager();
  });

  it('should read file from disk', async () => {
    const mockContent = Buffer.from('audio data');
    vi.mocked(fs.promises.readFile).mockResolvedValue(mockContent as any);

    const result = await manager.loadFile('/path/to/file.mp3');

    expect(fs.promises.readFile).toHaveBeenCalledWith('/path/to/file.mp3');
    expect(result).toBeDefined();
  });

  it('should handle file not found error', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = await manager.loadFile('/nonexistent.mp3');

    expect(result).toBeNull();
  });
});
```

### Testing Manager Initialization

Test singleton initialization patterns:

```typescript
describe('TrackManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ✅ Reset singleton instance between tests
    vi.resetModules();
  });

  it('should create singleton instance', async () => {
    const manager1 = await TrackManager.getInstance();
    const manager2 = await TrackManager.getInstance();

    expect(manager1).toBe(manager2);  // Same instance
  });

  it('should register IPC channels on initialization', async () => {
    vi.mock('electron');
    const manager = await TrackManager.getInstance();

    expect(ipcMain.handle).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
  });
});
```

### Testing Error Handling & Edge Cases

```typescript
describe('DiscordManager', () => {
  let manager: DiscordManager;

  beforeEach(() => {
    manager = new DiscordManager();
  });

  describe('connect', () => {
    it('should handle invalid token', async () => {
      const invalidToken = '';
      await expect(manager.connect(invalidToken)).rejects.toThrow();
    });

    it('should destroy existing connection before reconnecting', async () => {
      const destroySpy = vi.fn();
      manager.client = { destroy: destroySpy };

      await manager.connect('valid-token');

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should timeout if Discord is unreachable', async () => {
      // ✅ Use vi.useFakeTimers for timeout testing
      vi.useFakeTimers();
      const connectionPromise = manager.connect('token');

      vi.advanceTimersByTime(30000);

      await expect(connectionPromise).rejects.toThrow('Connection timeout');
      vi.useRealTimers();
    });
  });
});
```

---

## Minimal Test Coverage Strategy

### ✅ DO: Test Main Flows & Edge Cases

Focus on critical paths and common error scenarios:

```typescript
describe('DatabaseWrapper', () => {
  describe('readTable', () => {
    it('should read existing table', () => {
      const result = database.readTable('tracks');
      expect(result).toBeTruthy();
    });

    it('should return null when table does not exist', () => {
      const result = database.readTable('nonexistent' as any);
      expect(result).toBeNull();
    });

    it('should handle corrupted database file', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });
      
      expect(() => database.readTable('tracks')).toThrow();
    });
  });
});
```

### ❌ DON'T: Over-Test Covered Code

```typescript
// ❌ UNNECESSARY - already tested by calling the function
it('should have a getAll method', () => {
  expect(manager.getAll).toBeDefined();
});

// ❌ UNNECESSARY - trivial getters
it('should return audioPlayer property', () => {
  expect(manager.audioPlayer).toBeDefined();
});

// ✅ NECESSARY - business logic
it('should filter tracks by artist', () => {
  const filtered = manager.filterByArtist('Artist A');
  expect(filtered.length).toBe(1);
  expect(filtered[0].author).toBe('Artist A');
});
```

---

## Vitest-Specific Patterns

### Mocking Return Values

```typescript
beforeEach(() => {
  // ✅ Single return value
  mockFn.mockReturnValue(mockData);

  // ✅ Async operations
  mockFn.mockResolvedValue(mockData);

  // ✅ Error scenarios
  mockFn.mockRejectedValue(new Error('Failed'));

  // ✅ Multiple consecutive calls
  mockFn.mockReturnValueOnce(value1).mockReturnValueOnce(value2);

  // ✅ Custom implementation
  mockFn.mockImplementation((args) => {
    if (args.id === 'valid') return mockData;
    throw new Error('Invalid ID');
  });
});
```

### Spy & Call Assertions

```typescript
it('should call dependency with correct arguments', () => {
  manager.updateTrack('track-1', newData);

  expect(mockDatabase.updateTable).toHaveBeenCalledWith('tracks', newData);
  expect(mockDatabase.updateTable).toHaveBeenCalledTimes(1);
  expect(mockDatabase.updateTable).toHaveBeenCalledOnce();
});
```

### Module Mocking

```typescript
import { vi } from 'vitest';

// ✅ Mock entire module
vi.mock('@shared/models/track.model', () => ({
  Track: vi.fn(),
}));

// ✅ Mock with factory function
vi.mock('discord.js', () => ({
  Client: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(true),
  })),
}));

// ✅ Partial mock (keep some exports)
vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});
```

### Resetting Mocks Between Tests

```typescript
beforeEach(() => {
  // ✅ Clear all mocks for clean state
  vi.clearAllMocks();
});

afterEach(() => {
  // ✅ Restore all mocks after test
  vi.restoreAllMocks();
});
```

---

## Naming Conventions

### Test Descriptions

Use clear, descriptive test names following this pattern:

```typescript
// Pattern: "should [EXPECTED BEHAVIOR] when [CONDITION]"
it('should return track when id exists', () => {});
it('should return null when track not found', () => {});
it('should throw error when database connection fails', () => {});
it('should emit trackDeleted event when track is removed', () => {});
```

### File Naming

- **Managers**: `feature.manager.spec.ts`
- **Services**: `feature.service.spec.ts`
- **Utilities**: `feature.util.spec.ts`
- **Database**: `database.spec.ts`

### Variable Naming

```typescript
// Mock data prefixed with 'mock'
const mockTrack: Track = { ... };
const mockTracks: Track[] = [ ... };
const mockDatabase: any = { ... };

// Spy functions use 'mock' prefix too
const mockFn = vi.fn();
const mockImplementation = vi.fn();

// Manager/service instances use clear names
let trackManager: TrackManager;
let discordManager: DiscordManager;
```

---

## Common Patterns

### Testing Static Singleton Methods

```typescript
describe('TrackManager.getInstance', () => {
  beforeEach(() => {
    vi.resetModules();  // Reset singleton between tests
  });

  it('should return same instance on multiple calls', async () => {
    const instance1 = await TrackManager.getInstance();
    const instance2 = await TrackManager.getInstance();
    expect(instance1).toBe(instance2);
  });
});
```

### Testing IPC Channel Registration

```typescript
vi.mock('electron');

it('should register IPC handler when initialized', async () => {
  const mockIpcMain = vi.mocked(ipcMain);
  const manager = await TrackManager.getInstance();

  expect(mockIpcMain.handle).toHaveBeenCalledWith(
    'track:get-all',
    expect.any(Function)
  );
});
```

### Testing With Temporary Files

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('FilesManager', () => {
  const tempDir = path.join(process.cwd(), '.test-temp');

  beforeEach(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it('should read file from temp directory', async () => {
    const filePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(filePath, 'test content');

    const result = await manager.readFile(filePath);

    expect(result).toBe('test content');
  });
});
```

---

## Running Tests

### Run All Backend Tests
```bash
npm run test:electron
```

### Run Backend Tests in Watch Mode
```bash
npm run test:electron:watch
```

### Run ALL Tests (Frontend + Backend)
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test:electron src/main/managers/track.manager.spec.ts
```

### Run Tests Matching Pattern
```bash
npm run test:electron -- --grep="TrackManager"
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports are generated in:
- `frontend/coverage/` (Angular tests)
- `coverage/` (Electron tests)
- `coverage-merged/` (Combined report)

---

## Code Coverage & Quality Gates

**Vitest Configuration (vitest.config.ts):**
- Framework: Vitest 2.x with TypeScript
- Test Environment: Node (not browser)
- Coverage Reporter: c8 (lcov + HTML)
- Coverage Location: `coverage/`

**Best Practices:**
- Aim for >80% coverage on critical managers (TrackManager, DiscordManager, DatabaseWrapper)
- Focus on public APIs and IPC handlers
- Mock external dependencies (Electron, Discord.js, file system)
- Use `beforeEach` and `afterEach` for setup/teardown to ensure test isolation

---

## Important Rules

### ✅ DO

- ✅ Setup mock data in `beforeEach`
- ✅ Use `vi.fn()` for mocking functions (not Jasmine spies)
- ✅ Mock all Electron APIs—never test with real windows
- ✅ Mock file system—avoid real file I/O in tests
- ✅ Test public methods and main business flows
- ✅ Use descriptive test names
- ✅ Test edge cases (null, errors, timeouts)
- ✅ Keep tests focused and independent
- ✅ Use `vi.clearAllMocks()` between tests
- ✅ **Always use strict data types—never use `any` in test mocks**
- ✅ **Create mock factory functions for complex data**
- ✅ **Group related tests (3+) in `describe` blocks**
- ✅ **Use async/await for promise-based tests**

### ❌ DON'T

- ❌ Use real Electron APIs (BrowserWindow, app, ipcMain)—always mock
- ❌ Perform real file I/O—mock the file system
- ❌ Connect to real Discord—mock discord.js
- ❌ Share state between tests (reset mocks in `beforeEach`)
- ❌ Make tests depend on execution order
- ❌ Create unnecessarily complex mock data
- ❌ Test internal implementation details
- ❌ Commit console.log or debugging statements
- ❌ **Use `any` type for mock data—always declare proper types**
- ❌ **Create `describe` blocks for single simple tests**
- ❌ **Mix typed and untyped mock data in the same suite**
- ❌ **Use `setTimeout` in tests—use `vi.useFakeTimers()` instead**

---

## VS Code Copilot Optimization

When generating Electron test code, AI agents should:

1. **Immediately recognize this is an Electron backend project** from `applyTo: "src/**/*.spec.ts"`
2. **Use Vitest syntax (`vi.fn()`, `vi.mock()`)**, not Jasmine
3. **Create focused, minimal tests** that cover main flows only
4. **Setup all mocks in `beforeEach`** for consistency
5. **Mock Electron APIs completely**—never use real window/app instances
6. **Mock file system**—avoid real file operations
7. **Use TypeScript strict mode** with proper typing
8. **NEVER use `any` type** for mock data—always declare full TypeScript types
9. **Create mock factory functions** for complex data with proper typing
10. **Group related tests (3+) in `describe` blocks** by function or behavior
11. **Skip `describe` blocks for simple single-test functions** with no edge cases
12. **Reset mocks between tests** using `vi.clearAllMocks()` in `beforeEach`

---

## Analysis Summary

**Framework:** Vitest 2.x + TypeScript 5.8+  
**Test Environment:** Node.js (not browser)
**Target Coverage:**
- Managers (TrackManager, FilesManager, DiscordManager, etc.)
- Database operations
- IPC channel handlers
- Utility functions

**Key Electron Modules to Test:**
- `src/main/managers/*.ts` → All manager classes
- `src/main/database/database.ts` → Database wrapper
- `src/preload/*.ts` → IPC API definitions
- `src/sound-capture/*.ts` → Audio capture logic

**Mocking Strategy:**
- Mock all Electron APIs (`ipcMain`, `app`, `BrowserWindow`)
- Mock file system operations (`fs`, `path`)
- Mock external services (`discord.js`, `music-metadata`)
- Mock lowdb database for isolation

