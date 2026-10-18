import { describe, expect, it, vi } from 'vitest';
import {
  DisplayOrder,
  DisplayOrderPlacement,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import { DatabaseProvider } from '../database/database-provider';
import { DisplayOrderManager } from './display-order.manager';

describe('DisplayOrderManager', () => {
  it('heals duplicate and non-contiguous order records before applying relative reorder', async () => {
    let store: DisplayOrder[] = [
      {
        id: '1',
        entityId: 'scene-18',
        order: 8,
        entityType: OrderableEntityType.Scene,
        contextType: 'landing',
      },
      {
        id: '2',
        entityId: 'scene-19',
        order: 8,
        entityType: OrderableEntityType.Scene,
        contextType: 'landing',
      },
      {
        id: '3',
        entityId: 'scene-20',
        order: 9,
        entityType: OrderableEntityType.Scene,
        contextType: 'landing',
      },
      {
        id: '4',
        entityId: 'scene-18',
        order: 8,
        entityType: OrderableEntityType.Scene,
        contextType: 'landing',
      },
    ];

    const provider = {
      getMatching: vi.fn(async (fn: (item: DisplayOrder) => boolean) =>
        store.filter(fn)
      ),
      deleteMultiple: vi.fn(async (fn: (item: DisplayOrder) => boolean) => {
        store = store.filter((item) => !fn(item));
        return true;
      }),
      createMultiple: vi.fn(async (items: DisplayOrder[]) => {
        store = [...store, ...items];
        return items;
      }),
      replaceMultiple: vi.fn(async (items: DisplayOrder[]) => {
        const map = new Map(items.map((i) => [i.id, i]));
        store = store.map((item) => map.get(item.id) ?? item);
        return items;
      }),
    } as unknown as DatabaseProvider<DisplayOrder>;

    const manager = new DisplayOrderManager(provider);

    const afterMove20Between18And19 = await manager.setRelativeDisplayOrder(
      {
        entityId: 'scene-20',
        anchorEntityId: 'scene-19',
        placement: DisplayOrderPlacement.BEFORE,
      },
      OrderableEntityType.Scene,
      'landing'
    );

    expect(afterMove20Between18And19.get('scene-18')?.order).toBe(0);
    expect(afterMove20Between18And19.get('scene-20')?.order).toBe(1);
    expect(afterMove20Between18And19.get('scene-19')?.order).toBe(2);

    const afterMove18Between20And19 = await manager.setRelativeDisplayOrder(
      {
        entityId: 'scene-18',
        anchorEntityId: 'scene-20',
        placement: DisplayOrderPlacement.AFTER,
      },
      OrderableEntityType.Scene,
      'landing'
    );

    expect(afterMove18Between20And19.get('scene-20')?.order).toBe(0);
    expect(afterMove18Between20And19.get('scene-18')?.order).toBe(1);
    expect(afterMove18Between20And19.get('scene-19')?.order).toBe(2);
  });
});
