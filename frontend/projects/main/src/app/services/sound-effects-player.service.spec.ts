import { TestBed } from '@angular/core/testing';

import { SoundEffectsPlayerService } from './sound-effects-player.service';

describe('SoundEffectsPlayerService', () => {
  let service: SoundEffectsPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundEffectsPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
