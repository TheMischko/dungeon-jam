import { vi } from 'vitest';
import { ipcMain } from 'electron';
import { mockIpcMainEvent } from './mocks/mock-ipc-event.data';

/**
 * Standard unit test setup
 * Call this in beforeEach for typical manager tests
 */
export function setupTestEnvironment(): void {
  // Clear mocks between tests
  vi.resetModules();
  vi.clearAllMocks();
}

export function silenceConsole(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {
    return;
  });
}

export async function triggerIpcMainHandle<T>(
  channel: string,
  ...data: unknown[]
): Promise<T> {
  const mockCalls = vi.mocked(ipcMain.handle).mock.calls;
  const call = mockCalls.find((call: unknown[]) => {
    return call[0] === channel;
  });
  const handler = call?.[1];
  return await handler!(mockIpcMainEvent(), ...data);
}
