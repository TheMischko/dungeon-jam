import { TestBed } from '@angular/core/testing';

import { AudioFilesService } from './audio-files.service';

describe('AudioFilesService', () => {
  let service: AudioFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
