import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsDetailPageComponent } from './playlists-detail-page.component';

describe('PlaylistsDetailPageComponent', () => {
  let component: PlaylistsDetailPageComponent;
  let fixture: ComponentFixture<PlaylistsDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
