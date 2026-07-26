import { Service } from '@angular/core';
import { GeneralApiModel } from '../../../../../../general/models/api/general-api.model';
import { Observable, Subject } from 'rxjs';

@Service()
export class GeneralSettingsService {
  private readonly generalApiWindow = <GeneralApiModel>window;

  async openLogsDirectory(): Promise<void> {
    return await this.generalApiWindow.GENERAL_API.openLogsFolder();
  }

  getAppVersion(): Observable<string> {
    const subject = new Subject<string>();

    this.generalApiWindow.GENERAL_API.getAppVersion()
      .then((version) => {
        subject.next(version);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }
}
