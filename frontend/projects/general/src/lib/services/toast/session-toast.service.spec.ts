import { TestBed } from '@angular/core/testing';

import { SessionToastService } from './session-toast.service';

describe('SessionToastService', () => {
  let service: SessionToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
