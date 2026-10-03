import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { DisplayOrderApiService } from './display-order-api.service';
import {
  DisplayOrder,
  DisplayOrderMapQuery,
  OrderableEntityType,
} from '@shared/models/display-order.model';
import { DisplayOrderApiWindow } from '../../../models/api/display-order-api.model';

describe('DisplayOrderApiService', () => {
  let service: DisplayOrderApiService;

  const getDisplayOrderApi = () =>
    (window as unknown as DisplayOrderApiWindow).DISPLAY_ORDER_API;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayOrderApiService);

    (window as any).DISPLAY_ORDER_API = {
      getOrderMap: vi.fn().mockResolvedValue(new Map()),
    };
  });

  it('should call getOrderMap with query and return the order map', async () => {
    const mockOrderMap = new Map<string, DisplayOrder>([
      [
        'entity-1',
        {
          id: 'order-1',
          entityId: 'entity-1',
          order: 0,
          entityType: OrderableEntityType.Playlist,
          contextType: 'landing',
        },
      ],
    ]);

    vi.spyOn(getDisplayOrderApi(), 'getOrderMap').mockResolvedValue(
      mockOrderMap
    );

    const query: DisplayOrderMapQuery = {
      entityType: OrderableEntityType.Playlist,
      contextType: 'landing',
    };

    const result = await firstValueFrom(service.getOrderMap(query));

    expect(getDisplayOrderApi().getOrderMap).toHaveBeenCalledWith(query);
    expect(result).toBe(mockOrderMap);
  });

  it('should emit error when getOrderMap rejects', async () => {
    const testError = new Error('Failed to fetch order map');
    vi.spyOn(getDisplayOrderApi(), 'getOrderMap').mockRejectedValue(testError);

    const query: DisplayOrderMapQuery = {
      entityType: OrderableEntityType.Playlist,
      contextType: 'landing',
    };

    await expect(firstValueFrom(service.getOrderMap(query))).rejects.toEqual(
      testError
    );
  });
});
