import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsDetailPageComponent } from './playlists-detail-page.component';
import { Playlist } from '@shared/models/playlist.model';

describe('PlaylistsDetailPageComponent', () => {
  let component: PlaylistsDetailPageComponent;
  let fixture: ComponentFixture<PlaylistsDetailPageComponent>;

  const mockPlaylist: Playlist = {
    id: 'playlist-1',
    name: 'Test Playlist',
    tags: [],
    trackIds: [],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsDetailPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('playlist', mockPlaylist);
    fixture.componentRef.setInput('tracks', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
