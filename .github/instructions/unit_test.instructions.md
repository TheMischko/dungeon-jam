---
applyTo: "**/*.spec.ts"
---

# Unit Testing Instructions for Dungeon Jam

## Overview

This repository uses **Karma 6.4.0** with **Jasmine 5.6.0** for unit testing Angular projects. The testing stack is configured to run in **ChromeHeadless** with coverage reporting enabled.

**Primary Command:**
```bash
npm test  # Runs all tests in watch mode
```

---

## Test File Structure & Setup

### Service Tests

Services should follow this minimal structure with spies setup in `beforeEach`:

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';
import { DependencyService } from './dependency.service';

describe('MyService', () => {
  let service: MyService;
  let dependencyService: DependencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Add any required providers/imports here
    });
    service = TestBed.inject(MyService);
    dependencyService = TestBed.inject(DependencyService);
    
    // Setup spies here on injected services
    spyOn(dependencyService, 'someMethod').and.returnValue(of(data));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call dependency method when doing something', () => {
    service.publicMethod();
    expect(dependencyService.someMethod).toHaveBeenCalled();
  });
});
```

### Component Tests

Components should import themselves and use `ComponentFixture`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      // Add providers/dependencies as needed
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Directive Tests

Simple directives can be tested directly without TestBed:

```typescript
import { DirectiveName } from './directive-name.directive';

describe('DirectiveName', () => {
  it('should create an instance', () => {
    const directive = new DirectiveName();
    expect(directive).toBeTruthy();
  });
});
```

---

## Mock Data & Spy Setup

### ✅ DO: Setup Mock Data in `beforeEach`

Create all mock data at the top of the `beforeEach` block for test isolation:

```typescript
let service: MyService;
let mockTrack: Track;
let mockTracks: Track[];

beforeEach(() => {
  TestBed.configureTestingModule({});
  service = TestBed.inject(MyService);
  
  // Define mock data FIRST - ALWAYS use proper types, NEVER use `any`
  mockTrack = {
    id: 'test-1',
    name: 'Test Track',
    url: '/test.mp3',
    duration: 180,
    author: 'Test Artist'
  } as Track;  // Explicit type casting for clarity
  
  mockTracks = [mockTrack];
  
  // Setup spies AFTER mock data is ready
  spyOn(service, 'getTracks').and.returnValue(of(mockTracks));
  spyOn(service, 'getTrack').and.returnValue(of(mockTrack));
});
```

### ✅ DO: Use Injected Services with Spies

Always inject services and place spies on them—**do not store spy references**:

```typescript
let service: MyService;
let dependencyService: DependencyService;

beforeEach(() => {
  TestBed.configureTestingModule({});
  service = TestBed.inject(MyService);
  dependencyService = TestBed.inject(DependencyService);
  
  // Spy on injected service methods
  spyOn(dependencyService, 'fetchData').and.returnValue(of([]));
});

it('should call fetchData', () => {
  service.loadData();
  // Use injected service in expect, NOT a stored spy reference
  expect(dependencyService.fetchData).toHaveBeenCalled();
});
```

### ❌ DON'T: Store Spy References

Avoid storing the spy itself:

```typescript
// ❌ WRONG
let fetchSpy: jasmine.Spy;
beforeEach(() => {
  fetchSpy = spyOn(service, 'fetch').and.returnValue(of([]));
});
it('should call fetch', () => {
  component.doSomething();
  expect(fetchSpy).toHaveBeenCalled();  // ❌ Wrong approach
});

// ✅ RIGHT
beforeEach(() => {
  spyOn(service, 'fetch').and.returnValue(of([]));
});
it('should call fetch', () => {
  component.doSomething();
  expect(service.fetch).toHaveBeenCalled();  // ✅ Correct
});
```

### ✅ DO: Use Strict Data Typing (Never Use `any`)

Always declare mock data with proper TypeScript types. Never use `any` type in tests—this defeats the purpose of strict mode and hides bugs:

```typescript
import { Track, AudioTrack } from '../models/track.model';

let mockTrack: Track;  // ✅ Explicit type
let mockAudioTrack: AudioTrack;  // ✅ Explicit type

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
const mockTrackAny: any = { id: 'test', name: 'Song' };  // ❌ Never do this

// ❌ WRONG - Incomplete/partial mock without type
const incompleteMock = { name: 'Song' };  // ❌ Missing type annotation
```

**When mocks need to be partial or optional**, create a mock factory function with proper typing:

```typescript
function createMockTrack(overrides?: Partial<Track>): Track {
  return {
    id: 'track-1',
    name: 'Default Track',
    url: '/default.mp3',
    duration: 180,
    author: 'Default Artist',
    ...overrides  // Override defaults as needed
  } as Track;
}

beforeEach(() => {
  // ✅ Use factory with full type safety
  mockTrack = createMockTrack();
  mockTrackShort = createMockTrack({ duration: 60 });
});
```

### ✅ DO: Use Proper Observable Return Values

When spying on methods that return observables with no data (void-like behavior), use `EMPTY` or `of(null)` instead of `of(undefined)`:

```typescript
import { of, EMPTY } from 'rxjs';

beforeEach(() => {
  // ✅ For operations that complete without emitting data
  spyOn(service, 'deleteTrack').and.returnValue(EMPTY);
  
  // ✅ For operations that return null as data
  spyOn(service, 'getTrackIfExists').and.returnValue(of(null));
  
  // ✅ For operations with actual data
  spyOn(service, 'getTracks').and.returnValue(of(mockTracks));
  
  // ✅ Multiple return values on successive calls
  spyOn(service, 'getStatus')
    .and.returnValues(
      of('loading'),
      of('success'),
      of(null)
    );
});

it('should handle empty observable', fakeAsync(() => {
  service.deleteTrack('id').subscribe({
    complete: () => {
      expect(true).toBe(true);  // Verify completion
    }
  });
  tick();
}));

it('should handle null return value', fakeAsync(() => {
  let result: Track | null = undefined;
  service.getTrackIfExists('nonexistent').subscribe(track => {
    result = track;
  });
  tick();
  expect(result).toBeNull();
}));
```

**Key Pattern:**
- `EMPTY` → For operations that complete without emitting any value (side-effect operations)
- `of(null)` → For operations that explicitly return null/nothing as data
- `of(undefined)` → ❌ Avoid; use `of(null)` or `EMPTY` instead

---

## Describe Block Organization

### ✅ DO: Group Related Tests with `describe` Blocks

Use nested `describe` blocks to organize tests by functionality, especially when testing multiple edge cases or different code paths within the same function:

```typescript
describe('TrackService', () => {
  let service: TrackService;
  let mockTrack: Track;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackService);
    mockTrack = createMockTrack();
  });

  // ✅ Group all tests for getTrackById in a describe block
  describe('getTrackById', () => {
    it('should return track when id exists', () => {
      const result = service.getTrackById('track-1');
      expect(result).toEqual(mockTrack);
    });

    it('should return null when track not found', () => {
      const result = service.getTrackById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null when id is empty string', () => {
      const result = service.getTrackById('');
      expect(result).toBeNull();
    });
  });

  // ✅ Group all tests for updateTrack in a describe block
  describe('updateTrack', () => {
    it('should update track with valid data', () => {
      const updated = { ...mockTrack, name: 'Updated Name' };
      service.updateTrack(updated);
      expect(service.getTrackById('track-1')).toEqual(updated);
    });

    it('should not update track with invalid data', () => {
      service.updateTrack({ ...mockTrack, name: '' });
      expect(service.getTrackById('track-1')).toEqual(mockTrack);
    });
  });
});
```

### ❌ DON'T: Over-Use `describe` for Single Simple Tests

If a function has only one simple test case with no edge cases or conditional paths, skip the `describe` block:

```typescript
// ❌ OVER-COMPLICATED - Unnecessary describe for single simple test
describe('getTrackCount', () => {
  it('should return the number of tracks', () => {
    const count = service.getTrackCount();
    expect(count).toBe(1);
  });
});

// ✅ CORRECT - Direct test for simple function
it('should return the number of tracks', () => {
  const count = service.getTrackCount();
  expect(count).toBe(1);
});
```

### ✅ DO: Use Nested `describe` Blocks for Complex Scenarios

For testing the same function across different component states or user interactions:

```typescript
describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
  });

  // ✅ Group tests by user interaction
  describe('play button click', () => {
    it('should start playback when paused', () => {
      component.isPaused = true;
      component.onPlayClick();
      expect(component.isPlaying).toBe(true);
    });

    it('should pause playback when playing', () => {
      component.isPlaying = true;
      component.onPlayClick();
      expect(component.isPaused).toBe(true);
    });

    it('should emit trackStarted event when starting playback', () => {
      spyOn(component.trackStarted, 'emit');
      component.isPaused = true;
      component.onPlayClick();
      expect(component.trackStarted.emit).toHaveBeenCalled();
    });
  });

  // ✅ Group tests by different states
  describe('when track is loading', () => {
    beforeEach(() => {
      component.isLoading = true;
      fixture.detectChanges();
    });

    it('should display loading spinner', () => {
      const spinner = fixture.nativeElement.querySelector('.loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should disable play button', () => {
      const playButton = fixture.nativeElement.querySelector('[aria-label="Play"]');
      expect(playButton.disabled).toBe(true);
    });
  });
});
```

### Describe Block Guidelines

**Use `describe` when:**
- Testing multiple edge cases or error conditions of the same function
- Testing different states or user interactions of a component
- Testing a set of related methods (e.g., CRUD operations)
- You have 3+ tests for the same logical unit

**Skip `describe` when:**
- Testing a single simple function with one test case
- Testing trivial getters or constructors
- The function has no branching logic or edge cases

---

### Testing Public Methods

Focus tests on **public methods and their main flows**. Private methods are inherently tested when public methods are called:

```typescript
export class PlayerService {
  public play(trackId: string): void {
    this.currentTrack = this.findTrack(trackId);  // private method
    this.startPlayback();  // private method
  }

  private findTrack(id: string): Track | null {
    // Internal logic
  }

  private startPlayback(): void {
    // Internal logic
  }
}

// Test the public method—private methods are covered automatically
it('should play a track', () => {
  service.play('track-1');
  expect(service.getCurrentTrack()).toEqual(expectedTrack);
});
```

### Testing Private Methods Through Public Interfaces

If you need to verify private method behavior, test it through the public method's observable output or side effects:

```typescript
it('should find and play track when play is called', () => {
  const trackSpy = spyOn<any>(service, 'findTrack').and.returnValue(mockTrack);
  service.play('track-1');
  
  expect(trackSpy).toHaveBeenCalledWith('track-1');
  expect(service.getCurrentTrack()).toEqual(mockTrack);
});
```

### Testing Observable Services

Use `done()` callback or `fakeAsync/tick` for async operations:

```typescript
it('should return tracks', (done) => {
  service.getTracks().subscribe((tracks) => {
    expect(tracks).toEqual(mockTracks);
    done();
  });
});

// OR with fakeAsync (preferred for simpler cases)
import { fakeAsync, tick } from '@angular/core/testing';

it('should return tracks', fakeAsync(() => {
  let result: Track[] = [];
  service.getTracks().subscribe((tracks) => {
    result = tracks;
  });
  tick();
  expect(result).toEqual(mockTracks);
}));
```

### Testing with Component Inputs/Outputs

```typescript
it('should emit trackSelected when track is clicked', () => {
  spyOn(component.trackSelected, 'emit');
  
  component.track = mockTrack;
  component.onTrackClick();
  
  expect(component.trackSelected.emit).toHaveBeenCalledWith(mockTrack);
});
```

---

## Minimal Test Coverage Strategy

### ✅ DO: Test Main Flows & Edge Cases

Only test the critical paths:

```typescript
it('should return track by id', () => {
  const result = service.getTrackById('test-1');
  expect(result).toEqual(mockTrack);
});

it('should return null when track not found', () => {
  const result = service.getTrackById('nonexistent');
  expect(result).toBeNull();
});

it('should handle empty track list', () => {
  spyOn(service, 'getTracks').and.returnValue(of([]));
  service.loadTracks();
  expect(service.getTracks()).toHaveBeenCalled();
});
```

### ❌ DON'T: Over-Test Covered Code

Don't test scenarios that are already implicitly covered:

```typescript
// ❌ UNNECESSARY - already tested by calling the function
it('should have a getTracks method', () => {
  expect(service.getTracks).toBeDefined();
});

// ❌ UNNECESSARY - object creation is trivial
it('should create a Track object', () => {
  const track = new Track();
  expect(track).toBeTruthy();
});

// ✅ NECESSARY - tests actual business logic
it('should filter tracks by artist', () => {
  const filtered = service.filterByArtist('Artist A');
  expect(filtered.length).toBe(1);
  expect(filtered[0].author).toBe('Artist A');
});
```

---

## Spy & Mock Patterns

### Spying on Observable Returns

```typescript
beforeEach(() => {
  of(mockData) // Use 'of' from rxjs for synchronous Observable returns
  spyOn(service, 'getData').and.returnValue(of(mockData));
});

it('should call getData', () => {
  service.loadData();
  expect(service.getData).toHaveBeenCalled();
});
```

### Spying on Promise Returns

```typescript
beforeEach(() => {
  spyOn(service, 'fetchAsync').and.returnValue(Promise.resolve(mockData));
});

it('should handle async call', async () => {
  await service.callAsync();
  expect(service.fetchAsync).toHaveBeenCalled();
});
```

### Multiple Calls with Different Return Values

```typescript
beforeEach(() => {
  spyOn(service, 'getValue')
    .and.returnValues(
      of(value1),
      of(value2),
      of(value3)
    );
});

it('should return different values on successive calls', () => {
  expect(service.getValue()).toEqual(value1);
  expect(service.getValue()).toEqual(value2);
  expect(service.getValue()).toEqual(value3);
});
```

### Verify Call Arguments

```typescript
it('should call method with correct arguments', () => {
  service.updateTrack('track-1', newData);
  expect(service.updateTrack).toHaveBeenCalledWith('track-1', newData);
});

it('should call method at least once', () => {
  service.method();
  service.method();
  expect(service.method).toHaveBeenCalledTimes(2);
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
it('should emit trackChanged when play is called', () => {});
it('should call next() on unsubscribe', () => {});
```

### File Naming

- **Services**: `service-name.service.spec.ts`
- **Components**: `component-name.component.spec.ts`
- **Directives**: `directive-name.directive.spec.ts`
- **Pipes**: `pipe-name.pipe.spec.ts`

### Variable Naming

```typescript
// Mock data prefixed with 'mock'
const mockTrack: Track = { ... };
const mockTracks: Track[] = [ ... ];

// Service references use clear names
let trackService: TrackService;
let audioPlayerService: AudioPlayerService;

// Component and fixture follow convention
let component: MyComponent;
let fixture: ComponentFixture<MyComponent>;
```

---

## Common Patterns

### Testing Service Injection

```typescript
it('should inject dependency service', () => {
  const injectedService = TestBed.inject(DependencyService);
  expect(injectedService).toBeTruthy();
});
```

### Testing Error Handling

```typescript
it('should handle error gracefully', fakeAsync(() => {
  spyOn(service, 'getData').and.returnValue(
    throwError(() => new Error('Network error'))
  );
  
  service.loadData();
  tick();
  
  expect(service.isLoading).toBe(false);
  expect(service.error).toBeTruthy();
}));
```

### Testing Change Detection in Components

```typescript
it('should update view when data changes', () => {
  component.track = mockTrack;
  fixture.detectChanges();
  
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('.track-name')?.textContent).toContain(mockTrack.name);
});
```

### Testing with Custom Providers

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: DependencyService, useValue: mockDependencyService },
      // OR
      { provide: CONFIG_TOKEN, useValue: mockConfig }
    ]
  });
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests for Specific Project
```bash
cd frontend && npm run ng -- test --watch
```

### Run Tests Once (No Watch)
```bash
npm run ng -- test --watch=false
```

### Run Tests with Coverage
```bash
npm run ng -- test --code-coverage
```

Coverage reports are generated in `frontend/coverage/` directory.

### Run Specific Test File
```bash
npm run ng -- test --include='**/my-feature.spec.ts'
```

---

## Code Coverage & Quality Gates

**Current Configuration (karma.conf.js):**
- Framework: Jasmine 5.6.0
- Browser: ChromeHeadless
- Coverage Reporting: lcov + HTML
- Coverage Location: `frontend/coverage/`

**Best Practices:**
- Aim for >80% coverage on critical paths
- Focus on public APIs and main business logic
- Don't chase 100% coverage on trivial code
- Use `beforeEach` for all setup to ensure test isolation

---

## Important Rules

### ✅ DO

- ✅ Setup mock data in `beforeEach`
- ✅ Use `TestBed.inject()` to get service instances
- ✅ Place spies on injected services
- ✅ Use `.and.returnValue(of(...))` for Observable returns
- ✅ Test public methods and main business flows
- ✅ Use descriptive test names
- ✅ Test edge cases (null, empty arrays, errors)
- ✅ Keep tests focused and independent
- ✅ Reference injected services in assertions, not spy variables
- ✅ **Always use strict data types—never use `any` in test mocks**
- ✅ **Use `EMPTY` or `of(null)` for observable returns with no data**
- ✅ **Group related tests (3+ for same function) in `describe` blocks**
- ✅ **Create mock factory functions for complex or partial data**

### ❌ DON'T

- ❌ Store spy references—always use the injected service
- ❌ Over-test trivial code (getters, constructors)
- ❌ Share state between tests (avoid shared `let` variables outside `beforeEach`)
- ❌ Make tests depend on execution order
- ❌ Create unnecessarily complex mock data
- ❌ Test internal implementation details
- ❌ Use `async` when `fakeAsync` would work
- ❌ Commit commented-out test code
- ❌ **Use `any` type for mock data—always declare proper types**
- ❌ **Return `of(undefined)` for void-like observables—use `EMPTY` instead**
- ❌ **Create `describe` blocks for single simple tests—skip for trivial cases**
- ❌ **Mix typed and untyped mock data in the same test suite**

---

## VS Code Copilot Optimization

When generating test code, AI agents should:

1. **Immediately recognize this is an Angular + Jasmine project** from `applyTo: "**/*.spec.ts"`
2. **Use the exact spy + inject pattern** shown in this guide
3. **Create focused, minimal tests** that cover main flows only
4. **Setup all mocks in `beforeEach`** for consistency
5. **Reference injected services in `expect()`** statements, never stored spies
6. **Use TypeScript strict mode** with proper typing
7. **Avoid TestBed configuration bloat**—only add what's needed
8. **NEVER use `any` type** for mock data—always declare full TypeScript types
9. **Create mock factory functions** for complex data with proper typing (e.g., `createMockTrack()`)
10. **Use `EMPTY` for void-like observables** and `of(null)` for null returns—never `of(undefined)`
11. **Group related tests (3+) in `describe` blocks** by function name or user interaction
12. **Skip `describe` blocks for simple single-test functions** with no edge cases

---

## Analysis Summary

**Framework:** Karma 6.4.0 + Jasmine 5.6.0  
**Test Files Found:** 20 spec files across main, sidebar, topbar, and general projects  
**Test Patterns Analyzed:**
- Service testing with TestBed injection
- Component testing with ComponentFixture
- Spy setup and mock data patterns
- Observable and async testing patterns

**Repository Details:**
- Angular Version: 19.2.0
- TypeScript: 5.7.2 (strict mode)
- Test Runner: ChromeHeadless via Karma
- Coverage: Available via karma-coverage

