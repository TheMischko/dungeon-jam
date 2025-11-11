import { ComponentRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface DialogRef<Component, Result> {
  close(result?: Result): void;
  componentRef: ComponentRef<Component>;
  afterClosed$: Observable<Result | undefined>;
}
