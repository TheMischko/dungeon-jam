import { vi } from 'vitest';

/**
 * Standard unit test setup
 * Call this in beforeEach for typical manager tests
 */
export function setupTestEnvironment(): void {
  // Clear mocks between tests
  vi.clearAllMocks();
}

export function silenceConsole(): void {
  vi.spyOn(console, 'log').mockImplementation(() => { return; });
}