import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PendingUpdatesModalComponent } from './pending-updates-modal.component';

describe('PendingUpdatesModalComponent', () => {
  let component: PendingUpdatesModalComponent;
  let fixture: ComponentFixture<PendingUpdatesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingUpdatesModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { updates: [] } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingUpdatesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
