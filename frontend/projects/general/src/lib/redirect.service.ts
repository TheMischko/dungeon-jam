import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';
import {RedirectPath} from '@shared/models/redirect.model';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private redirectSubject = new Subject<RedirectPath>();

  constructor() {
    (window as unknown as GeneralApiWindow).generalApi.registerRedirect((path: RedirectPath) => this.handleRedirect(path));
  }

  handleRedirect(path: RedirectPath): void{
    this.redirectSubject.next(path);
  }
}

type GeneralApiWindow = {
  generalApi: {
    registerRedirect: (callback: (path: RedirectPath) => void|Promise<void>) => void
  }
}
