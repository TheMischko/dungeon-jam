import { TestBed } from '@angular/core/testing';

import { TrackHighlightService } from './track-highlight.service';

describe('TrackHighlightService', () => {
  let service: TrackHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
