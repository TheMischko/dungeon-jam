import { ComponentRef } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

export interface DialogRef<Component, Result> {
  close(result?: Result): void;
  componentRef: ComponentRef<Component>;
  currentRef: MatDialogRef<unknown>;
  afterClosed$: Observable<Result | undefined>;
}
