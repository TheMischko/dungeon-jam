import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistWithTagData } from '../../../../../../../../../general/models/playlist.model';
import { GridPlaylistSizeConfig } from '../../../../../../models/grid-item-size-config.model';

import { PlaylistGridItemComponent } from './playlist-grid-item.component';

const mockPlaylist: PlaylistWithTagData = {
  id: 'playlist-1',
  name: 'Test Playlist',
  tags: [],
  trackIds: [],
  order: 0,
  dateCreated: new Date(0),
  dateUpdated: new Date(0),
};

const mockSizeConfig: GridPlaylistSizeConfig = {
  imageSize: 100,
  titleSize: 12,
};

describe('PlaylistGridItemComponent', () => {
  let component: PlaylistGridItemComponent;
  let fixture: ComponentFixture<PlaylistGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistGridItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistGridItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('playlist', mockPlaylist);
    fixture.componentRef.setInput('sizeConfig', mockSizeConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
