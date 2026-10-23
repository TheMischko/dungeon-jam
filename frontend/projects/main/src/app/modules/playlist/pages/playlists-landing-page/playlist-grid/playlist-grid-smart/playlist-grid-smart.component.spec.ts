import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistGridSmartComponent } from './playlist-grid-smart.component';

describe('PlaylistGridSmartComponent', () => {
  let component: PlaylistGridSmartComponent;
  let fixture: ComponentFixture<PlaylistGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistGridSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select and deselect a playlist on click when itemSelectable is true', async () => {
    const playlist = {
      id: 'p1',
      name: 'Playlist 1',
      trackIds: [],
      tags: [],
      childrenIds: [],
      order: 0,
      dateCreated: new Date(0),
      dateUpdated: new Date(0),
    };
    fixture.componentRef.setInput('itemSelectable', true);
    fixture.componentRef.setInput('itemDetailNavigation', false);
    fixture.detectChanges();
    component.playlists.set([playlist]);

    const emitted: unknown[] = [];
    component.selected.subscribe((val) => emitted.push(val));

    await component.onPlaylistClick('p1');
    expect(component.selectedPlaylist()).toEqual(playlist);
    expect(emitted.at(-1)).toEqual(playlist);

    await component.onPlaylistClick('p1');
    expect(component.selectedPlaylist()).toBeNull();
    expect(emitted.at(-1)).toBeNull();
  });
});
