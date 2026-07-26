import { TestBed } from '@angular/core/testing';

import { SessionSceneService } from './session-scene.service';

describe('SessionSceneService', () => {
  let service: SessionSceneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionSceneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
