import { TestBed } from '@angular/core/testing';

import { DiscoverTracksStateService } from './discover-tracks-state.service';

describe('DiscoverTracksStateService', () => {
  let service: DiscoverTracksStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscoverTracksStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
