import { TestBed } from '@angular/core/testing';

import { RoutingListenerService } from './routing-listener.service';

describe('RoutingListenerService', () => {
  let service: RoutingListenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingListenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
