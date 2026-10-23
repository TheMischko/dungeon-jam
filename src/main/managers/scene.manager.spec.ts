import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SceneChannel } from '@shared/models/channels.model';
import {
  DisplayOrder,
  DisplayOrderPlacement,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import {
  Scene,
  SceneOrderContext,
  ScenesRelativeDisplayOrderQuery,
} from '@shared/models/scene.model';
import { DatabaseProvider } from '../database/database-provider';
import { ImageManager } from './image.manager';
import { DisplayOrderManager } from './display-order.manager';
import { SceneManager } from './scene.manager';
import { SoundEffectManager } from './sound-effect.manager';
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

describe('SceneManager', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('delegates relative scene ordering through the IPC handler', async () => {
    const orderMap = new Map<string, DisplayOrder>();
    const displayOrderManager = {
      setRelativeDisplayOrder: vi.fn().mockResolvedValue(orderMap),
    } as unknown as DisplayOrderManager;
    const sceneManager = new SceneManager(
      {} as DatabaseProvider<Scene>,
      {} as SoundEffectManager,
      {} as ImageManager,
      displayOrderManager
    );
    const registerChannels = (
      sceneManager as unknown as { registerChannels: () => void }
    ).registerChannels.bind(sceneManager);
    registerChannels();

    const query: ScenesRelativeDisplayOrderQuery = {
      entityId: 'scene-2',
      anchorEntityId: 'scene-1',
      placement: DisplayOrderPlacement.BEFORE,
      contextType: SceneOrderContext.Landing,
    };

    const result = await triggerIpcMainHandle<Map<string, DisplayOrder>>(
      SceneChannel.CHANGE_ORDER,
      query
    );

    expect(displayOrderManager.setRelativeDisplayOrder).toHaveBeenCalledWith(
      query,
      OrderableEntityType.Scene,
      SceneOrderContext.Landing,
      undefined
    );
    expect(result).toBe(orderMap);
  });
});
