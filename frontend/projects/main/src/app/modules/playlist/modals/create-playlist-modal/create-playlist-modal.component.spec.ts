import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  CreatePlaylistModalComponent,
  CreatePlaylistModalData,
} from './create-playlist-modal.component';

describe('CreatePlaylistModalComponent', () => {
  let component: CreatePlaylistModalComponent;
  let fixture: ComponentFixture<CreatePlaylistModalComponent>;

  const mockDialogData: CreatePlaylistModalData = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlaylistModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePlaylistModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
