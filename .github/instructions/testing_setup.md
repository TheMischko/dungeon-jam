---
applyTo: "**/*.spec.ts"
---

# Testing Setup Guide for Dungeon Jam

## Quick Start

### Install Dependencies

The project now includes Vitest for Electron backend testing alongside Karma/Jasmine for Angular frontend testing.

```bash
npm install
cd frontend && npm install && cd ..
```

### Run Tests

```bash
# Run ALL tests (Frontend + Backend)
npm run test

# Run only Electron backend tests
npm run test:electron

# Run only Electron backend tests in watch mode
npm run test:electron:watch

# Watch both frontend and backend tests simultaneously
npm run test:watch

# Generate coverage reports for both
npm run test:coverage
```

---

## Testing Architecture Overview

This project now has a **unified testing strategy** for both Angular frontend and Electron backend:

### Frontend Tests (Angular + Karma + Jasmine)
- **Framework**: Karma 6.4.0 + Jasmine 5.6.0
- **Environment**: ChromeHeadless
- **Location**: `frontend/projects/*/src/**/*.spec.ts`
- **Run**: `cd frontend && npm run test`
- **Instructions**: See `.github/instructions/unit_test.instructions.md`

### Backend Tests (Electron + Vitest)
- **Framework**: Vitest 1.0.4 + TypeScript
- **Environment**: Node.js
- **Location**: `src/**/*.spec.ts`
- **Run**: `npm run test:electron`
- **Instructions**: See `.github/instructions/electron_test.instructions.md`

### Unified Test Command
```bash
npm run test              # Runs both frontend and backend once
npm run test:watch       # Runs both in watch mode (requires 2 terminals or concurrently)
npm run test:coverage    # Generates coverage for both
```

---

## Why Vitest for Electron?

We chose **Vitest** over Karma for backend testing because:

1. **Node.js First** - Vitest is designed for backend/Node.js code, not browser environments
2. **Familiar API** - Uses Jasmine-like syntax (`describe`, `it`, `expect`) so Angular developers feel at home
3. **Superior Mocking** - Built-in mocking for:
   - Electron APIs (ipcMain, app, BrowserWindow)
   - File system operations
   - External packages (discord.js, music-metadata, lowdb)
4. **Unified Commands** - Can run both Angular and Electron tests with one command
5. **Faster Execution** - Significantly faster than Karma for backend tests
6. **Watch Mode** - Hot-reload tests during development

---

## Test Structure Comparison

### Frontend Test (Angular + Jasmine)
```typescript
// Location: frontend/projects/main/src/app/services/track.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

**Instructions**: `.github/instructions/unit_test.instructions.md`

---

### Backend Test (Electron + Vitest)
```typescript
// Location: src/main/managers/track.manager.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackManager } from './track.manager';

describe('TrackManager', () => {
  let manager: TrackManager;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = { readTable: vi.fn() };
    manager = new TrackManager(mockDatabase);
  });

  it('should be created', () => {
    expect(manager).toBeTruthy();
  });
});
```

**Instructions**: `.github/instructions/electron_test.instructions.md`

---

## Key Differences: Jasmine vs Vitest

| Feature | Jasmine (Frontend) | Vitest (Backend) |
|---------|-------------------|------------------|
| Import | N/A (global scope) | `import { describe, it, expect, vi } from 'vitest'` |
| Mocking Functions | `spyOn(obj, 'method')` | `vi.fn()` |
| Mocking Modules | N/A | `vi.mock('module')` |
| Return Values | `.and.returnValue()` | `.mockReturnValue()` |
| Async Handling | `done()` or `fakeAsync/tick` | `async/await` |
| Reset Between Tests | N/A | `vi.clearAllMocks()` |
| File System | Test the component tree | Mock with `vi.mock('fs')` |
| Electron APIs | Not applicable | Always mock (`vi.mock('electron')`) |

---

## File Organization

```
dungeon-jam/
├── vitest.config.ts                          # ← NEW: Vitest configuration
├── package.json                              # ← UPDATED: Added test scripts & dependencies
│
├── .github/
│   └── instructions/
│       ├── unit_test.instructions.md         # Angular + Jasmine testing guide
│       └── electron_test.instructions.md     # ← NEW: Electron + Vitest testing guide
│
├── src/
│   ├── main/
│   │   ├── managers/
│   │   │   ├── track.manager.ts
│   │   │   ├── track.manager.spec.ts         # ← NEW: Vitest spec files
│   │   │   ├── discord.manager.ts
│   │   │   └── discord.manager.spec.ts
│   │   └── database/
│   │       ├── database.ts
│   │       └── database.spec.ts
│   └── preload/
│       ├── track-api.ts
│       └── track-api.spec.ts
│
├── frontend/
│   └── projects/
│       ├── main/
│       │   └── src/app/services/
│       │       ├── track.service.ts
│       │       └── track.service.spec.ts     # Jasmine spec files
│       └── ...
│
└── coverage/                                  # ← NEW: Electron test coverage
    ├── index.html
    └── lcov.info

frontend/coverage/                             # Existing: Angular test coverage
    ├── index.html
    └── lcov.info
```

---

## Coverage Reports

### Generate All Coverage Reports
```bash
npm run test:coverage
```

This generates:
1. **Electron Coverage**: `coverage/` (Vitest)
2. **Angular Coverage**: `frontend/coverage/` (Karma)

View the reports in your browser:
```bash
# Electron backend
open coverage/index.html

# Angular frontend
open frontend/coverage/index.html
```

---

## Development Workflow

### Scenario 1: Working on a Single Feature

**Example: Adding a new track filtering method to TrackManager**

```bash
# Terminal 1: Watch backend tests
npm run test:electron:watch

# Terminal 2: Watch frontend tests (if needed)
cd frontend && npm run test

# Make changes to src/main/managers/track.manager.ts
# Tests auto-run in both terminals
```

### Scenario 2: Before Committing Code

```bash
# Run all tests once (both pass or fail together)
npm run test

# If tests pass, check coverage
npm run test:coverage

# Review coverage reports to ensure adequate testing
```

### Scenario 3: Running Tests in CI/CD

```bash
# Single command runs all tests
npm run test

# If you want coverage reports too
npm run test:coverage
```

---

## Common Commands Reference

### For Frontend (Angular) Developers

```bash
cd frontend

# Run Angular tests
npm run test

# Run specific project
ng test --include='**/main/**'

# Generate coverage
ng test --code-coverage --watch=false
```

**Guide**: `.github/instructions/unit_test.instructions.md`

---

### For Backend (Electron) Developers

```bash
# Run Electron tests
npm run test:electron

# Run Electron tests in watch mode
npm run test:electron:watch

# Run specific test file
npm run test:electron src/main/managers/track.manager.spec.ts

# Run tests matching pattern
npm run test:electron -- --grep="TrackManager"

# Generate Electron coverage
npm run test:electron:coverage
```

**Guide**: `.github/instructions/electron_test.instructions.md`

---

### For Full-Stack Development

```bash
# Run all tests (frontend + backend)
npm run test

# Run all tests in watch mode (requires concurrently)
npm run test:watch

# Generate coverage for both
npm run test:coverage
```

---

## Setting Up Your IDE

### VS Code

#### Vitest Extension (Electron Tests)
1. Install: **Vitest** by *marklindstrom* (ID: `marklindstrom.vitest`)
2. Adds test icons, quick run buttons, and debugging

#### Karma Extension (Angular Tests)
1. VS Code has built-in support for Karma tests
2. Use Angular language service extension for better support

#### Example: Run test from IDE
- Click the test icon next to `describe` or `it` blocks
- Tests run in the editor, results show inline

---

## Troubleshooting

### Issue: "Cannot find module 'vitest'"
**Solution:**
```bash
npm install
```

### Issue: Tests hang or timeout
**Solution:**
```bash
# Check if mocks are properly configured
# Vitest default timeout is 10 seconds
# Increase in vitest.config.ts if needed:
testTimeout: 30000  // 30 seconds
```

### Issue: Electron API tests fail with "Cannot find module 'electron'"
**Solution:**
Make sure to mock Electron in your test:
```typescript
vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn() },
  // ... other mocks
}));
```

### Issue: File system tests writing real files
**Solution:**
Mock the file system:
```typescript
vi.mock('node:fs');
```

---

## Code Quality Standards (Unified)

Regardless of frontend or backend, all tests should follow these principles:

1. **Type Safety**: Never use `any` type—always declare proper TypeScript types
2. **Mock Setup**: Define all mocks in `beforeEach`
3. **Isolation**: Clear mocks between tests using `vi.clearAllMocks()` (backend) or test isolation (frontend)
4. **Descriptive Names**: Use pattern: "should [BEHAVIOR] when [CONDITION]"
5. **Focused Tests**: One assertion per test, or tightly related assertions
6. **Minimal Coverage**: Test main flows and edge cases, not trivial code
7. **Mock Factory Functions**: Create helper functions for complex mock data
8. **Describe Blocks**: Group 3+ related tests, skip for simple cases

---

## Next Steps

1. **Read the Frontend Guide**: `.github/instructions/unit_test.instructions.md`
2. **Read the Backend Guide**: `.github/instructions/electron_test.instructions.md`
3. **Start Writing Tests**:
   - Create `*.spec.ts` files next to your source files
   - Follow patterns from the respective guide
   - Run tests frequently during development
4. **Check Coverage**: Run `npm run test:coverage` before pushing commits

---

## References

- **Vitest Docs**: https://vitest.dev
- **Jasmine Docs**: https://jasmine.github.io
- **Karma Docs**: https://karma-runner.github.io
- **TypeScript Testing**: https://www.typescriptlang.org/docs/handbook/testing.html

