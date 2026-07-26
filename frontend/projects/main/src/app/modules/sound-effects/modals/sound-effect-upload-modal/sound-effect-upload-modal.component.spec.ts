import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  SoundEffectUploadModalComponent,
  SoundEffectUploadModalData,
} from './sound-effect-upload-modal.component';

const mockData: SoundEffectUploadModalData = {
  audioTracks: [],
  tagsMap: new Map(),
};

describe('SoundEffectUploadModalComponent', () => {
  let component: SoundEffectUploadModalComponent;
  let fixture: ComponentFixture<SoundEffectUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectUploadModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
