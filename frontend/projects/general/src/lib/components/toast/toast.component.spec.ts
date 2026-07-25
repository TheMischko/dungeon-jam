import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

import { ToastComponent } from './toast.component';
import { ToastData, ToastType } from '../../../../models/toast.model';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    const mockData: ToastData = {
      title: 'Test toast',
      type: ToastType.Success,
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
        { provide: MatSnackBarRef, useValue: { dismiss: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
