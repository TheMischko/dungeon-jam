import { TestBed } from '@angular/core/testing';

import { AutoUpdateService } from './auto-update.service';

describe('AutoUpdateService', () => {
  let service: AutoUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
