import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Playlist } from '@shared/models/playlist.model';
import {
  PlaylistSelectionModalComponent,
  PlaylistSelectionModalData,
} from './playlist-selection-modal.component';

const mockPlaylist: Playlist = {
  id: 'playlist-1',
  name: 'Dungeon Ambience',
  trackIds: [],
  tags: [],
  childrenIds: [],
  order: 0,
  dateCreated: new Date(0),
  dateUpdated: new Date(0),
};

describe('PlaylistSelectionModalComponent', () => {
  let component: PlaylistSelectionModalComponent;
  let fixture: ComponentFixture<PlaylistSelectionModalComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  const setup = async (data: PlaylistSelectionModalData | null = null) => {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [PlaylistSelectionModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should initialize with pre-assigned playlist selected and emit it on save', async () => {
    await setup({ selectedPlaylist: mockPlaylist });
    expect(component.currentSelection()).toEqual(mockPlaylist);

    component.save();
    expect(closeSpy).toHaveBeenCalledWith(mockPlaylist);
  });

  it('should emit null on save when no playlist is selected or after deselection', async () => {
    await setup({ selectedPlaylist: mockPlaylist });
    component.updateSelection(null);
    component.save();
    expect(closeSpy).toHaveBeenCalledWith(null);
  });

  it('should close with undefined on cancel', async () => {
    await setup({ selectedPlaylist: mockPlaylist });
    component.cancel();
    expect(closeSpy).toHaveBeenCalledWith(undefined);
  });
});
