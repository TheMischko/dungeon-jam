import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  TracksUploadModalComponent,
  TracksUploadModalData,
} from './tracks-upload-modal.component';

describe('TracksUploadModalComponent', () => {
  let component: TracksUploadModalComponent;
  let fixture: ComponentFixture<TracksUploadModalComponent>;

  const mockDialogData: TracksUploadModalData = {
    title: 'Upload Tracks',
    tracks: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TracksUploadModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TracksUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
