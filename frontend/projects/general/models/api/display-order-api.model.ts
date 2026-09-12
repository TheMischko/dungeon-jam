import {
  DisplayOrder,
  DisplayOrderMapQuery,
} from '@shared/models/display-order.model';

export type DisplayOrderApiWindow = Window &
  typeof globalThis & {
    DISPLAY_ORDER_API: {
      getOrderMap: (
        query: DisplayOrderMapQuery
      ) => Promise<Map<string, DisplayOrder>>;
    };
  };
