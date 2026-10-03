export interface DisplayOrder extends DisplayOrderBase {
  // DisplayOrder database identifier.
  id: string;
  // Type of the ordered entity.
  entityType: OrderableEntityType;
  // Where it is being ordered.
  contextType: string;
  // Optional context identifier.
  contextId?: string;
}

export interface DisplayOrderBase {
  // Identifier of the ordered entity.
  entityId: string;
  // Zero based index of the order of the entity.
  order: number;
}

export enum OrderableEntityType {
  Playlist = 'playlist',
  SoundEffect = 'sound-effect',
}

export interface RelativeDisplayOrderQuery {
  // Entity being moved.
  entityId: string;
  // ID of the entity to position relative to. Undefined is used for placing an
  // item to very end or very beginning.
  anchorEntityId?: string;
  placement: DisplayOrderPlacement;
}

export enum DisplayOrderPlacement {
  BEFORE = 'before',
  AFTER = 'after',
}

export interface DisplayOrderMapQuery {
  entityType: OrderableEntityType;
  contextType: string;
  contextId?: string;
}

