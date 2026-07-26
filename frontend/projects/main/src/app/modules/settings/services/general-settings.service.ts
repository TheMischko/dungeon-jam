import { Service } from '@angular/core';
import { GeneralApiModel } from '../../../../../../general/models/api/general-api.model';

@Service()
export class GeneralSettingsService {
  private readonly generalApiWindow = <GeneralApiModel>window;

  async openLogsDirectory(): Promise<void> {
    return await this.generalApiWindow.GENERAL_API.openLogsFolder();
  }
}
