import { TestBed } from '@angular/core/testing';

import { ScenePlayerService } from './scene-player.service';

describe('ScenePlayerService', () => {
  let service: ScenePlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScenePlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
