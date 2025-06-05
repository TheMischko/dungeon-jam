import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {RedirectPath} from '@shared/models/redirect.model';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private redirectSubject = new Subject<RedirectPath>();

  constructor() {
    (window as unknown as GeneralApiWindow).GENERAL_API.registerRedirect((path: RedirectPath) => this.handleRedirect(path));
  }

  get redirect$(): Observable<RedirectPath>{
    return this.redirectSubject.asObservable();
  }

  private handleRedirect(path: RedirectPath): void{
    this.redirectSubject.next(path);
  }
}

type GeneralApiWindow = {
  GENERAL_API: {
    registerRedirect: (callback: (path: RedirectPath) => void|Promise<void>) => void
  }
}
