import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { vi } from 'vitest';
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';
import {
  SessionOrderContext,
  SessionRelativeDisplayOrderQuery,
} from '@shared/models/session.model';
import { DisplayOrderApiService } from '@general/services/display-order-api.service';
import { SessionApiService } from '@general/services/session-api.service';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  it('serializes relative reorder requests and updates the latest order map', () => {
    const firstResponse = new Subject<Map<string, DisplayOrder>>();
    const secondResponse = new Subject<Map<string, DisplayOrder>>();
    const responses = [firstResponse, secondResponse];
    let responseIndex = 0;

    const sessionApiService: Pick<SessionApiService, 'changeOrder'> = {
      changeOrder: vi.fn(
        (
          query: SessionRelativeDisplayOrderQuery
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
        { provide: SessionApiService, useValue: sessionApiService },
        { provide: DisplayOrderApiService, useValue: displayOrderApiService },
      ],
    });

    const store = TestBed.inject(SessionStore);
    const firstQuery = {
      entityId: 'session-2',
      anchorEntityId: 'session-1',
      placement: DisplayOrderPlacement.BEFORE,
    };
    const secondQuery = {
      entityId: 'session-3',
      anchorEntityId: 'session-2',
      placement: DisplayOrderPlacement.AFTER,
    };
    const firstOrderMap = new Map<string, DisplayOrder>();
    const secondOrderMap = new Map<string, DisplayOrder>();

    store.changeRelativeOrder(firstQuery);
    store.changeRelativeOrder(secondQuery);

    expect(sessionApiService.changeOrder).toHaveBeenCalledTimes(1);
    expect(sessionApiService.changeOrder).toHaveBeenNthCalledWith(1, {
      ...firstQuery,
      contextType: SessionOrderContext.Landing,
    });

    firstResponse.next(firstOrderMap);
    firstResponse.complete();

    expect(sessionApiService.changeOrder).toHaveBeenCalledTimes(2);
    expect(sessionApiService.changeOrder).toHaveBeenNthCalledWith(2, {
      ...secondQuery,
      contextType: SessionOrderContext.Landing,
    });

    secondResponse.next(secondOrderMap);
    secondResponse.complete();

    expect(store.latestOrderMap()).toBe(secondOrderMap);
  });
});
