import { TestBed } from '@angular/core/testing';

import { DefaultTrackActionsService } from './default-track-actions.service';

describe('DefaultTrackActionsService', () => {
  let service: DefaultTrackActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultTrackActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
