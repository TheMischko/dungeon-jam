import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionChannel } from '@shared/models/channels.model';
import {
  DisplayOrder,
  DisplayOrderPlacement,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import {
  SessionData,
  SessionOrderContext,
  SessionRelativeDisplayOrderQuery,
} from '@shared/models/session.model';
import { DatabaseProvider } from '../database/database-provider';
import { DisplayOrderManager } from './display-order.manager';
import { SessionManager } from './session.manager';
import { setupTestEnvironment, triggerIpcMainHandle } from '../testing/setup';

const mockElectron = vi.hoisted(() => ({
  app: {
    getPath: vi.fn(() => '/test-path'),
  },
  ipcMain: {
    handle: vi.fn(),
  },
}));

vi.mock('electron', () => mockElectron);

describe('SessionManager', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('delegates relative session ordering through the IPC handler', async () => {
    const orderMap = new Map<string, DisplayOrder>();
    const displayOrderManager = {
      setRelativeDisplayOrder: vi.fn().mockResolvedValue(orderMap),
    } as unknown as DisplayOrderManager;
    const sessionManager = new SessionManager(
      {} as DatabaseProvider<SessionData>,
      displayOrderManager
    );
    const registerChannels = (
      sessionManager as unknown as { registerHandlers: () => void }
    ).registerHandlers.bind(sessionManager);
    registerChannels();

    const query: SessionRelativeDisplayOrderQuery = {
      entityId: 'session-2',
      anchorEntityId: 'session-1',
      placement: DisplayOrderPlacement.BEFORE,
      contextType: SessionOrderContext.Landing,
    };

    const result = await triggerIpcMainHandle<Map<string, DisplayOrder>>(
      SessionChannel.CHANGE_ORDER,
      query
    );

    expect(displayOrderManager.setRelativeDisplayOrder).toHaveBeenCalledWith(
      query,
      OrderableEntityType.Session,
      SessionOrderContext.Landing,
      undefined
    );
    expect(result).toBe(orderMap);
  });
});
