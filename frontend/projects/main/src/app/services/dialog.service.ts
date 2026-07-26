import { inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { DialogRef } from '../models/dialog.model';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef = inject(MatDialog);
  private openDialogs: MatDialogRef<unknown, unknown>[] = [];

  open<C, R>(
    content: ComponentType<C>,
    dialogConfig?: Partial<MatDialogConfig>
  ): DialogRef<C, R> {
    const config: MatDialogConfig = {
      hasBackdrop: false,
      disableClose: true,
      scrollStrategy: new NoopScrollStrategy(),
      data: null,
      width: '700px',
      maxWidth: '90vw',
      panelClass: 'app-dialog-container',
      ...dialogConfig,
    };

    const currentRef = this.dialogRef.open<C, any, R>(content, config);
    this.openDialogs.push(currentRef);
    return {
      close: (result?: R) => {
        this.removeDialogRefFromOpen(currentRef);
        currentRef.close(result);
      },
      afterClosed$: currentRef.afterClosed().pipe(
        take(1),
        tap(() => this.removeDialogRefFromOpen(currentRef))
      ),
      currentRef,
      componentRef: currentRef.componentRef!,
    };
  }

  closeMostRecentDialog(): void {
    const dialogRef = this.openDialogs.pop();
    if (!dialogRef) {
      return;
    }
    dialogRef.close();
  }

  closeAllDialogs(): void {
    while (this.openDialogs.length > 0) {
      const dialogRef = this.openDialogs.pop();
      dialogRef?.close();
    }
  }

  private removeDialogRefFromOpen(dialogRef: MatDialogRef<unknown>) {
    this.openDialogs = this.openDialogs.filter((ref) => ref !== dialogRef);
  }
}
