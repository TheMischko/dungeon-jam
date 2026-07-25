import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SelectLibraryTracksModalComponent } from './select-library-tracks-modal.component';

describe('SelectLibraryTracksModalComponent', () => {
  let component: SelectLibraryTracksModalComponent;
  let fixture: ComponentFixture<SelectLibraryTracksModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLibraryTracksModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { excludedTrackIds: [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectLibraryTracksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
