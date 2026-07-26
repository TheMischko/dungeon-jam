import { TestBed } from '@angular/core/testing';

import { LoadSoundService } from './load-sound.service';

describe('LoadSoundService', () => {
  let service: LoadSoundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadSoundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
