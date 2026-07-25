import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  UpdatePlaylistModalComponent,
  UpdatePlaylistModalData,
} from './update-playlist-modal.component';
import { Playlist } from '@shared/models/playlist.model';

describe('UpdatePlaylistModalComponent', () => {
  let component: UpdatePlaylistModalComponent;
  let fixture: ComponentFixture<UpdatePlaylistModalComponent>;

  const mockPlaylist: Playlist = {
    id: 'playlist-1',
    name: 'Test Playlist',
    tags: [],
    trackIds: [],
    order: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
  };

  const mockDialogData: UpdatePlaylistModalData = {
    playlist: mockPlaylist,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePlaylistModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePlaylistModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
