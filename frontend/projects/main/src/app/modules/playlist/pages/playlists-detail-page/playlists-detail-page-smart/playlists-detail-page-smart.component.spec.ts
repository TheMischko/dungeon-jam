import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsDetailPageSmartComponent } from './playlists-detail-page-smart.component';

describe('PlaylistsDetailPageSmartComponent', () => {
  let component: PlaylistsDetailPageSmartComponent;
  let fixture: ComponentFixture<PlaylistsDetailPageSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsDetailPageSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsDetailPageSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
