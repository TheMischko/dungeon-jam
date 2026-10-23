import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RedirectRequest } from '@shared/models/redirect.model';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private redirectSubject = new Subject<RedirectRequest | null>();

  private lastRedirectRequest: RedirectRequest | null = null;
  private history: RedirectRequest[] = [];

  constructor() {
    (window as unknown as GeneralApiWindow).GENERAL_API.registerRedirect(
      (request: RedirectRequest) => this.handleRedirect(request)
    );
  }

  get redirect$(): Observable<RedirectRequest | null> {
    return this.redirectSubject.asObservable();
  }

  triggerRedirect(request: RedirectRequest): void {
    (window as unknown as GeneralApiWindow).GENERAL_API.triggerRedirect(
      request
    );
  }

  navigateBack(): void {
    const recentRedirect = this.history.splice(0, 1)?.[0];
    if (!recentRedirect) {
      return;
    }
    this.lastRedirectRequest = null;
    this.triggerRedirect(recentRedirect);
  }

  getLatestHistoryRecord(): RedirectRequest | null {
    return this.history.splice(0, 1)?.[0] ?? null;
  }

  private handleRedirect(request: RedirectRequest): void {
    this.redirectSubject.next(request);
    if (this.lastRedirectRequest) {
      this.history.unshift({ ...this.lastRedirectRequest });
    }
    this.lastRedirectRequest = request;
    // Reset to null after a short delay to allow effects to complete
    setTimeout(() => this.redirectSubject.next(null), 100);
  }
}

type GeneralApiWindow = {
  GENERAL_API: {
    registerRedirect: (
      callback: (request: RedirectRequest) => void | Promise<void>
    ) => void;
    triggerRedirect: (request: RedirectRequest) => void;
  };
};
