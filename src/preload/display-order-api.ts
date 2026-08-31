import { ipcRenderer } from 'electron';
import { DisplayOrderChannel } from '@shared/models/channels.model';
import {
  DisplayOrder,
  DisplayOrderMapQuery,
} from '@shared/models/display-order.model';

const getOrderMap = async (
  query: DisplayOrderMapQuery
): Promise<Map<string, DisplayOrder>> => {
  return await ipcRenderer.invoke(DisplayOrderChannel.GET_ORDER_MAP, query);
};

export default {
  getOrderMap,
};
