import { TestBed } from '@angular/core/testing';

import { PlaylistToastService } from './playlist-toast.service';

describe('PlaylistToastService', () => {
  let service: PlaylistToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
