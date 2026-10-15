import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { vi } from 'vitest';
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';
import {
  SceneOrderContext,
  ScenesRelativeDisplayOrderQuery,
} from '@shared/models/scene.model';
import { DisplayOrderApiService } from '@general/services/display-order-api.service';
import { SceneApiService } from '@general/services/scene-api.service';
import { ScenesStore } from './scenes.store';

describe('ScenesStore', () => {
  it('serializes relative reorder requests and updates the latest order map', () => {
    const firstResponse = new Subject<Map<string, DisplayOrder>>();
    const secondResponse = new Subject<Map<string, DisplayOrder>>();
    const responses = [firstResponse, secondResponse];
    let responseIndex = 0;

    const sceneApiService: Pick<SceneApiService, 'changeOrder'> = {
      changeOrder: vi.fn(
        (
          query: ScenesRelativeDisplayOrderQuery
        ): Observable<Map<string, DisplayOrder>> => {
          return responses[responseIndex++].asObservable();
        }
      ),
    };
    const displayOrderApiService: Pick<
      DisplayOrderApiService,
      'getOrderMap'
    > = {
      getOrderMap: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SceneApiService, useValue: sceneApiService },
        { provide: DisplayOrderApiService, useValue: displayOrderApiService },
      ],
    });

    const store = TestBed.inject(ScenesStore);
    const firstQuery: ScenesRelativeDisplayOrderQuery = {
      entityId: 'scene-2',
      anchorEntityId: 'scene-1',
      placement: DisplayOrderPlacement.BEFORE,
      contextType: SceneOrderContext.Landing,
    };
    const secondQuery: ScenesRelativeDisplayOrderQuery = {
      entityId: 'scene-3',
      anchorEntityId: 'scene-2',
      placement: DisplayOrderPlacement.AFTER,
      contextType: SceneOrderContext.Landing,
    };
    const firstOrderMap = new Map<string, DisplayOrder>();
    const secondOrderMap = new Map<string, DisplayOrder>();

    store.changeRelativeOrder({
      entityId: firstQuery.entityId,
      anchorEntityId: firstQuery.anchorEntityId,
      placement: firstQuery.placement,
    });
    store.changeRelativeOrder({
      entityId: secondQuery.entityId,
      anchorEntityId: secondQuery.anchorEntityId,
      placement: secondQuery.placement,
    });

    expect(sceneApiService.changeOrder).toHaveBeenCalledTimes(1);
    expect(sceneApiService.changeOrder).toHaveBeenNthCalledWith(1, firstQuery);

    firstResponse.next(firstOrderMap);
    firstResponse.complete();

    expect(sceneApiService.changeOrder).toHaveBeenCalledTimes(2);
    expect(sceneApiService.changeOrder).toHaveBeenNthCalledWith(2, secondQuery);

    secondResponse.next(secondOrderMap);
    secondResponse.complete();

    expect(store.latestOrderMap()).toBe(secondOrderMap);
  });
});
