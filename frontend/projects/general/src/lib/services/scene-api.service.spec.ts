import { TestBed } from '@angular/core/testing';

import { SceneApiService } from './scene-api.service';

describe('SceneApiService', () => {
  let service: SceneApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SceneApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
