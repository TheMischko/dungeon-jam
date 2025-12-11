import { Injectable } from '@angular/core';
import { GeneralApiModel } from '../../../models/api/general-api.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStateService {
  private readonly window = window as unknown as GeneralApiModel;

  private isApplicationReady = new BehaviorSubject<boolean>(false);

  public get applicationReady$() {
    return this.isApplicationReady.asObservable();
  }

  constructor() {
    this.window.GENERAL_API.onApplicationReady(() => {
      this.isApplicationReady.next(true);
    });
  }
}
