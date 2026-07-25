import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EditTrackModalComponent } from './edit-track-modal.component';
import { Track } from '@shared/models/track.model';

describe('EditTrackModalComponent', () => {
  let component: EditTrackModalComponent;
  let fixture: ComponentFixture<EditTrackModalComponent>;

  const mockTrack: Track = {
    id: 'track-1',
    name: 'Test Track',
    url: 'file:///test.mp3',
    duration: 120,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrackModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockTrack },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTrackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
