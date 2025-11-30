import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RedirectPath } from '@shared/models/redirect.model';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private redirectSubject = new Subject<RedirectPath | null>();

  constructor() {
    (window as unknown as GeneralApiWindow).GENERAL_API.registerRedirect(
      (path: RedirectPath) => this.handleRedirect(path),
    );
  }

  get redirect$(): Observable<RedirectPath | null> {
    return this.redirectSubject.asObservable();
  }

  triggerRedirect(path: RedirectPath): void {
    (window as unknown as GeneralApiWindow).GENERAL_API.triggerRedirect(path);
  }

  private handleRedirect(path: RedirectPath): void {
    console.log('redirecting to', path);
    this.redirectSubject.next(path);
    // Reset to null after a short delay to allow effects to complete
    setTimeout(() => this.redirectSubject.next(null), 100);
  }
}

type GeneralApiWindow = {
  GENERAL_API: {
    registerRedirect: (
      callback: (path: RedirectPath) => void | Promise<void>,
    ) => void;
    triggerRedirect: (path: RedirectPath) => void;
  };
};
