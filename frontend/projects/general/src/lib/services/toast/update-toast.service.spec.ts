import { TestBed } from '@angular/core/testing';
import { UpdateToastService } from './update-toast.service';
import { ToastService } from '../toast.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastType } from '../../../../models/toast.model';

describe('UpdateToastService', () => {
  let service: UpdateToastService;
  let toastServiceMock: { createToast: ReturnType<typeof vi.fn> };
  let translateServiceMock: { instant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    toastServiceMock = {
      createToast: vi.fn(),
    };
    translateServiceMock = {
      instant: vi.fn((key: string) => `translated:${key}`),
    };

    TestBed.configureTestingModule({
      providers: [
        UpdateToastService,
        { provide: ToastService, useValue: toastServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    });

    service = TestBed.inject(UpdateToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show up to date toast with Info type', () => {
    service.showUpToDate();

    expect(translateServiceMock.instant).toHaveBeenCalledWith(
      'NOTIFICATIONS.UPDATE.UP_TO_DATE_TITLE'
    );
    expect(translateServiceMock.instant).toHaveBeenCalledWith(
      'NOTIFICATIONS.UPDATE.UP_TO_DATE_MESSAGE'
    );
    expect(toastServiceMock.createToast).toHaveBeenCalledWith(
      'translated:NOTIFICATIONS.UPDATE.UP_TO_DATE_TITLE',
      'translated:NOTIFICATIONS.UPDATE.UP_TO_DATE_MESSAGE',
      ToastType.Info
    );
  });

  it('should show check failed toast with Error type', () => {
    service.showCheckFailed();

    expect(translateServiceMock.instant).toHaveBeenCalledWith(
      'NOTIFICATIONS.UPDATE.CHECK_FAILED_TITLE'
    );
    expect(translateServiceMock.instant).toHaveBeenCalledWith(
      'NOTIFICATIONS.UPDATE.CHECK_FAILED_MESSAGE'
    );
    expect(toastServiceMock.createToast).toHaveBeenCalledWith(
      'translated:NOTIFICATIONS.UPDATE.CHECK_FAILED_TITLE',
      'translated:NOTIFICATIONS.UPDATE.CHECK_FAILED_MESSAGE',
      ToastType.Error
    );
  });
});
