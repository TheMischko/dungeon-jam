import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { RedirectRequest } from '@shared/models/redirect.model';

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  private redirectSubject = new Subject<RedirectRequest | null>();
  private historySubject = new BehaviorSubject<RedirectRequest[]>([]);

  private lastRedirectRequest: RedirectRequest | null = null;

  get latestHistoryRecord$(): Observable<RedirectRequest | null> {
    return this.historySubject.asObservable().pipe(
      map((history) => {
        return history[0] ?? null;
      })
    );
  }

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
    const recentRedirect = this.historySubject.getValue()[0];
    if (!recentRedirect) {
      return;
    }
    this.lastRedirectRequest = null;
    this.historySubject.next(this.historySubject.getValue().slice(1));
    this.triggerRedirect(recentRedirect);
  }

  private handleRedirect(request: RedirectRequest): void {
    this.redirectSubject.next(request);
    if (this.lastRedirectRequest) {
      this.historySubject.next([
        { ...this.lastRedirectRequest },
        ...this.historySubject.value,
      ]);
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
