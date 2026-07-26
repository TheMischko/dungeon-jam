import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsLandingPageComponent } from './playlists-landing-page.component';

describe('PlaylistsLandingPageComponent', () => {
  let component: PlaylistsLandingPageComponent;
  let fixture: ComponentFixture<PlaylistsLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
