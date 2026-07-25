import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EditSessionModalComponent } from './edit-session-modal.component';

describe('EditSessionModalComponent', () => {
  let component: EditSessionModalComponent;
  let fixture: ComponentFixture<EditSessionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSessionModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSessionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
