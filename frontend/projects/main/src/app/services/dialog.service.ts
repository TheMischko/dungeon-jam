import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { DialogRef } from '../models/dialog.model';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef = inject(MatDialog);

  open<C, R>(
    content: ComponentType<C>,
    dialogConfig?: Partial<MatDialogConfig>,
  ): DialogRef<C, R> {
    const config: MatDialogConfig = {
      hasBackdrop: false,
      disableClose: true,
      scrollStrategy: new NoopScrollStrategy(),
      data: null,
      width: '800px',
      height: '800px',
      ...dialogConfig,
    };

    const currentRef = this.dialogRef.open<C, any, R>(content, config);
    return {
      close() {
        currentRef.close();
      },
      afterClosed$: currentRef.afterClosed(),
      componentRef: currentRef.componentRef!,
    };
  }
}
