import { TestBed } from '@angular/core/testing';

import { NewSoundEffectUploadService } from './new-sound-effect-upload.service';

describe('NewSoundEffectUploadService', () => {
  let service: NewSoundEffectUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewSoundEffectUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
