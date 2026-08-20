import { TestBed } from '@angular/core/testing';

import { TrackTransitionService } from './track-transition.service';

describe('TrackTransitionService', () => {
  let service: TrackTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackTransitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
