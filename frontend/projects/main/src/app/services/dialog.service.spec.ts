import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { Component } from '@angular/core';
import { DialogRef } from '../models/dialog.model';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('closeAllDialogs', () => {
    it('should close all the dialogs', () => {
      const dialogA = openDialogWithTest(service);
      const dialogB = openDialogWithTest(service);

      service.closeAllDialogs();

      expect(dialogA.currentRef.close).toHaveBeenCalledOnce();
      expect(dialogB.currentRef.close).toHaveBeenCalledOnce();

      expect(service['openDialogs'].length).toEqual(0);
    });
  });
});

@Component({
  selector: 'test-component',
  template: '',
})
class TestComponent {}

function openDialogWithTest(
  service: DialogService
): DialogRef<unknown, unknown> {
  const dialogRef = service.open(TestComponent);
  vi.spyOn(dialogRef.currentRef, 'close');
  return dialogRef;
}
