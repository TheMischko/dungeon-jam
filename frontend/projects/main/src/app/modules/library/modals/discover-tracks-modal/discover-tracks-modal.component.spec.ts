import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  DiscoverTracksModalComponent,
  DiscoverTracksModalData,
} from './discover-tracks-modal.component';
import { Playlist } from '@shared/models/playlist.model';

describe('DiscoverTracksModalComponent', () => {
  let component: DiscoverTracksModalComponent;
  let fixture: ComponentFixture<DiscoverTracksModalComponent>;

  const mockPlaylist: Playlist = {
    id: 'playlist-1',
    name: 'Test Playlist',
    tags: [],
    trackIds: [],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  const mockDialogData: DiscoverTracksModalData = {
    playlist: mockPlaylist,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverTracksModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoverTracksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
