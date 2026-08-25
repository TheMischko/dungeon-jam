import { DatabaseProvider } from '../database/database-provider';
import {
  DisplayOrder,
  DisplayOrderBase,
  DisplayOrderPlacement,
  OrderableEntityType,
  RelativeDisplayOrderQuery,
} from '@shared/models/display-order.model';
import { DatabaseProviderCreator } from '../database/database-provider-creator';
import { Logger } from '../utils/logger';
import { v4 as uuid } from 'uuid';

export class DisplayOrderManager {
  private static instance: DisplayOrderManager;

  private logger = new Logger('DisplayOrder', 'magenta');

  constructor(
    private readonly displayOrderProvider: DatabaseProvider<DisplayOrder>
  ) {}

  public static async getInstance(): Promise<DisplayOrderManager> {
    if (!this.instance) {
      const databaseCreator = DatabaseProviderCreator.create<DisplayOrder>();
      const databaseProvider = await databaseCreator
        .setTable('displayOrder')
        .setIdColumn('id')
        .complete();
      this.instance = new DisplayOrderManager(databaseProvider);
    }
    return this.instance;
  }

  public async getOrderMap(
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<Map<string, DisplayOrder>> {
    const orderEntities = await this.getMatching(
      entityType,
      contextType,
      contextId
    );

    return orderEntities.reduce((map, entity) => {
      map.set(entity.entityId, entity);
      return map;
    }, new Map<string, DisplayOrder>());
  }

  public async getOrderedEntityIds(
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<string[]> {
    const orderEntities = await this.getMatching(
      entityType,
      contextType,
      contextId
    );

    return orderEntities
      .sort((a, b) => a.order - b.order)
      .map((e) => e.entityId);
  }

  public async appendEntity(
    entityId: string,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<void> {
    const orderedEntityList = await this.getOrderedEntityIds(
      entityType,
      contextType,
      contextId
    );
    const newOrderEntity: Omit<DisplayOrder, 'id'> = {
      entityId,
      entityType,
      contextType,
      contextId,
      order: orderedEntityList.length,
    };
    await this.displayOrderProvider.create(newOrderEntity);
  }

  public async setDisplayOrder(
    entityId: string,
    newOrder: number,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<void> {
    const orderedEntityList = await this.getMatching(
      entityType,
      contextType,
      contextId
    );
    const target = orderedEntityList.find((e) => e.entityId === entityId);

    if (!target) {
      this.logger.logErrorMessage('Cannot find entity to change order', {
        entityId,
        newOrder,
        entityType,
        contextType,
        contextId,
      });
      return;
    }

    const oldOrder = target.order;

    const validNewOrder = Math.max(
      0,
      Math.min(newOrder, orderedEntityList.length - 1)
    );

    if (oldOrder === validNewOrder) {
      return;
    }

    const updates = orderedEntityList.map((item) => {
      let updatedOrder = item.order;

      if (item.entityId === entityId) {
        updatedOrder = validNewOrder;
      } else if (
        oldOrder < validNewOrder &&
        item.order > oldOrder &&
        item.order <= validNewOrder
      ) {
        updatedOrder = item.order - 1;
      } else if (
        oldOrder > validNewOrder &&
        item.order >= validNewOrder &&
        item.order < oldOrder
      ) {
        updatedOrder = item.order + 1;
      }

      return updatedOrder !== item.order
        ? { ...item, order: updatedOrder }
        : item;
    });

    const changedEntities = updates.filter(
      (item, index) => item !== orderedEntityList[index]
    );

    await this.displayOrderProvider.replaceMultiple(changedEntities);
  }

  public async setRelativeDisplayOrder(
    query: RelativeDisplayOrderQuery,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<void> {
    const orderedEntityList = await this.getMatching(
      entityType,
      contextType,
      contextId
    );
    const target = orderedEntityList.find((e) => e.entityId === query.entityId);
    if (!target) {
      this.logger.logErrorMessage('Cannot find entity to change order', {
        query,
      });
      return;
    }
    const anchor: DisplayOrder | undefined = query.anchorEntityId
      ? orderedEntityList.find((e) => e.entityId === anchor!.id)
      : undefined;
    if (query.anchorEntityId && !anchor) {
      this.logger.logErrorMessage('Cannot find anchor entity to change order', {
        query,
      });
      return;
    }

    const newOrder = this.resolveAbsoluteOrder(
      orderedEntityList,
      anchor,
      query.placement
    );
    await this.setDisplayOrder(
      query.entityId,
      newOrder,
      entityType,
      contextType,
      contextId
    );
  }

  public async replaceCollection(
    batch: DisplayOrderBase[],
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ) {
    this.logger.log('Replacing collection of orders', {
      entityType,
      contextType,
      contextId,
      data: batch,
    });
    await this.displayOrderProvider.deleteMultiple((item) =>
      this.matchingFunction(item, entityType, contextType, contextId)
    );
    this.logger.log('Old data deleted for replace', {
      entityType,
      contextType,
      contextId,
    });
    return await this.displayOrderProvider.createMultiple(
      batch.map((base) => ({
        ...base,
        entityType,
        contextType,
        contextId,
        id: uuid(),
      }))
    );
  }

  public async removeFromCollection(
    entityId: string,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<void> {
    const orderedIds = await this.getOrderedEntityIds(
      entityType,
      contextType,
      contextId
    );
    const filteredIds = orderedIds.filter((id) => id !== entityId);

    if (!filteredIds.length) {
      return;
    }

    const batch = filteredIds.map(
      (val, index) =>
        ({
          entityId: val,
          order: index,
        }) as DisplayOrderBase
    );

    await this.replaceCollection(batch, entityType, contextType, contextId);
  }

  public async repairCollection<T>(
    items: T[],
    idField: keyof T,
    sortFn: (
      a: T,
      orderA: number | undefined,
      b: T,
      orderB: number | undefined
    ) => number,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<Map<string, DisplayOrder>> {
    const healedRecords: DisplayOrderBase[] = [];

    const currentOrderMap = await this.getOrderMap(
      entityType,
      contextType,
      contextId
    );

    items
      .sort((a, b) =>
        sortFn(
          a,
          currentOrderMap.get(a[idField] as string)?.order,
          b,
          currentOrderMap.get(b[idField] as string)?.order
        )
      )
      .forEach((item, index) => {
        healedRecords.push({
          entityId: item[idField] as string,
          order: index,
        });
      });

    const newOrder = await this.replaceCollection(
      healedRecords,
      entityType,
      contextType,
      contextId
    );

    return new Map(newOrder.map((r) => [r.entityId, r]));
  }

  private async getMatching(
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): Promise<DisplayOrder[]> {
    const matching = await this.displayOrderProvider.getMatching((orderItem) =>
      this.matchingFunction(orderItem, entityType, contextType, contextId)
    );

    return matching.sort((a, b) => a.order - b.order);
  }

  /**
   * Returns true if `orderItem` matches `entityType, `contextType` and `contextId`.
   */
  private matchingFunction(
    orderItem: DisplayOrder,
    entityType: OrderableEntityType,
    contextType: string,
    contextId?: string
  ): boolean {
    if (orderItem.entityType !== entityType) {
      return false;
    }
    if (orderItem.contextType !== contextType) {
      return false;
    }
    return !(contextId && orderItem.contextId !== contextId);
  }

  private resolveAbsoluteOrder(
    orderedEntityList: DisplayOrder[],
    anchor: DisplayOrder | undefined,
    placement: DisplayOrderPlacement
  ) {
    if (!anchor) {
      return placement === DisplayOrderPlacement.BEFORE
        ? 0
        : orderedEntityList.length - 1;
    }
    return placement === DisplayOrderPlacement.BEFORE
      ? anchor.order
      : anchor.order + 1;
  }
}
