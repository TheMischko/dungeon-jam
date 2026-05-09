import { Injectable } from '@angular/core';
import { GeneralApiModel } from '../../../models/api/general-api.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { OperatingSystem } from '@shared/models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStateService {
  private readonly window = <GeneralApiModel>window;

  private isApplicationReady = new BehaviorSubject<boolean>(false);
  private operatingSystem = new BehaviorSubject<OperatingSystem | undefined>(
    undefined
  );

  public get applicationReady$() {
    return this.isApplicationReady.asObservable();
  }

  public get operatingSystem$() {
    return this.operatingSystem.asObservable();
  }

  constructor() {
    this.window.GENERAL_API.onApplicationReady(async () => {
      if (this.isApplicationReady.getValue()) {
        return;
      }
      this.isApplicationReady.next(true);

      await this.updateOSInfo();
    });
  }

  public closeApp(): Observable<void> {
    const subject = new Subject<void>();

    this.window.GENERAL_API.closeApp()
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject;
  }

  public minimizeApp(): Observable<void> {
    const subject = new Subject<void>();

    this.window.GENERAL_API.minimizeApp()
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject;
  }

  public maximizeApp(): Observable<void> {
    const subject = new Subject<void>();

    this.window.GENERAL_API.maximizeApp()
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject;
  }

  private async updateOSInfo(): Promise<void> {
    if (this.operatingSystem.getValue()) {
      console.error('Fetching OS info more than once.');
      return;
    }
    const os = await this.window.GENERAL_API.getOS();
    this.operatingSystem.next(os);
  }
}
