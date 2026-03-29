import { TestBed } from '@angular/core/testing';

import { NewTrackDropInService } from './new-track-drop-in.service';

describe('NewTrackDropInService', () => {
  let service: NewTrackDropInService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewTrackDropInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
