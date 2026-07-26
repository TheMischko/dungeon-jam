import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Playlist } from '@shared/models/playlist.model';

import { ChildPlaylistBoxComponent } from './child-playlist-box.component';

const mockPlaylist: Playlist = {
  id: 'playlist-1',
  name: 'Test Playlist',
  tags: [],
  trackIds: [],
  order: 0,
  dateCreated: new Date(0),
  dateUpdated: new Date(0),
};

describe('ChildPlaylistBoxComponent', () => {
  let component: ChildPlaylistBoxComponent;
  let fixture: ComponentFixture<ChildPlaylistBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPlaylistBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildPlaylistBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('playlist', mockPlaylist);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
