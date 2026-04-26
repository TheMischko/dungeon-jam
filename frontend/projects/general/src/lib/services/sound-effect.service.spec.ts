import { TestBed } from '@angular/core/testing';

import { SoundEffectService } from './sound-effect.service';

describe('SoundEffectService', () => {
  let service: SoundEffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundEffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
