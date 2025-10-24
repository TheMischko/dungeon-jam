import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeneralChannels } from '@shared/models/channels.model';
import { mockElectron } from '../testing/mocks/mock-electron';
import { mockIpcMainEvent } from '../testing/mocks/mock-ipc-event.data';
import {
  mockViewManager,
  mockViewManagerInstance,
} from '../testing/mocks/mock-view-manager';
import { setupTestEnvironment, silenceConsole } from '../testing/setup';
import { RedirectManager } from './redirect.manager';
import { ipcMain } from 'electron';

vi.mock('electron', () => mockElectron);
vi.mock('./view.manager', () => mockViewManager);

describe('RedirectManager', () => {
  beforeEach(() => {
    setupTestEnvironment();
    silenceConsole();

    Object.assign(RedirectManager, {
      instance: undefined,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should create a new instance and register channels', async () => {
      const redirectManager = await RedirectManager.getInstance();

      expect(redirectManager).toBeTruthy();
      expect(ipcMain.on).toHaveBeenCalledWith(
        GeneralChannels.REDIRECT,
        expect.any(Function),
      );
    });

    it('should reuse the same instance if called multiple times', async () => {
      const instanceA = await RedirectManager.getInstance();
      const instanceB = await RedirectManager.getInstance();

      expect(instanceA).toBe(instanceB);
    });
  });

  it('should broadcast a message for redirect if the manager gets a request', async () => {
    await RedirectManager.getInstance();

    const mockCalls = vi.mocked(ipcMain.on).mock.calls;
    const redirectCall = mockCalls.find(
      (call: any[]) => call[0] === GeneralChannels.REDIRECT,
    );

    if (!redirectCall) {
      throw new Error('no redirect call!');
    }
    const handler = redirectCall[1];
    expect(typeof handler).toBe('function');

    handler(mockIpcMainEvent({ processId: 123 }), 'test-path');

    expect(mockViewManagerInstance.broadcast).toHaveBeenCalledWith(
      GeneralChannels.REDIRECT,
      expect.any(Number),
      expect.any(String),
    );
  });
});
