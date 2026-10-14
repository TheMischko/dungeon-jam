import { TestBed } from '@angular/core/testing';
import { AutoUpdateService } from './auto-update.service';
import { DialogService } from './dialog.service';
import { UpdateToastService } from '@general/services/toast/update-toast.service';
import { firstValueFrom, of } from 'rxjs';
import { AppUpdateInfo } from '@shared/models/application.model';

describe('AutoUpdateService', () => {
  let service: AutoUpdateService;
  let dialogServiceMock: { open: ReturnType<typeof vi.fn> };
  let updateToastServiceMock: {
    showUpToDate: ReturnType<typeof vi.fn>;
    showCheckFailed: ReturnType<typeof vi.fn>;
  };

  let originalUpdateApi: any;

  beforeEach(() => {
    originalUpdateApi = (window as any).UPDATE_API;
    dialogServiceMock = {
      open: vi.fn().mockReturnValue({ afterClosed$: of(true) }),
    };
    updateToastServiceMock = {
      showUpToDate: vi.fn(),
      showCheckFailed: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AutoUpdateService,
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: UpdateToastService, useValue: updateToastServiceMock },
      ],
    });

    service = TestBed.inject(AutoUpdateService);
  });

  afterEach(() => {
    (window as any).UPDATE_API = originalUpdateApi;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchAndShowUpdates', () => {
    it('should show up to date toast when no updates available', async () => {
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue([]),
      };

      await firstValueFrom(service.fetchAndShowUpdates());

      expect(updateToastServiceMock.showUpToDate).toHaveBeenCalled();
      expect(dialogServiceMock.open).not.toHaveBeenCalled();
    });

    it('should open dialog when updates are available', async () => {
      const mockUpdates: AppUpdateInfo[] = [{ version: '1.0.0', note: 'New features' }];
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue(mockUpdates),
        updateApp: vi.fn().mockResolvedValue(undefined),
      };

      await firstValueFrom(service.fetchAndShowUpdates());

      expect(dialogServiceMock.open).toHaveBeenCalled();
      expect(updateToastServiceMock.showUpToDate).not.toHaveBeenCalled();
    });

    it('should show check failed toast when update check errors', async () => {
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockRejectedValue(new Error('Network offline')),
      };

      await firstValueFrom(service.fetchAndShowUpdates());

      expect(updateToastServiceMock.showCheckFailed).toHaveBeenCalled();
      expect(dialogServiceMock.open).not.toHaveBeenCalled();
    });
  });

  describe('showUpdatesIfNotSkipped', () => {
    it('should do nothing when no updates are available', async () => {
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue([]),
        getPreferences: vi.fn().mockResolvedValue({}),
      };

      await firstValueFrom(service.showUpdatesIfNotSkipped());

      expect(dialogServiceMock.open).not.toHaveBeenCalled();
    });

    it('should open dialog when updates are available and not skipped', async () => {
      const mockUpdates: AppUpdateInfo[] = [{ version: '2.0.0', note: 'Major release' }];
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue(mockUpdates),
        getPreferences: vi.fn().mockResolvedValue({ skippedVersion: '1.0.0' }),
        updateApp: vi.fn().mockResolvedValue(undefined),
      };

      await firstValueFrom(service.showUpdatesIfNotSkipped());

      expect(dialogServiceMock.open).toHaveBeenCalled();
    });

    it('should not open dialog when version is skipped and within 30 days', async () => {
      const mockUpdates: AppUpdateInfo[] = [{ version: '2.0.0', note: 'Major release' }];
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue(mockUpdates),
        getPreferences: vi.fn().mockResolvedValue({
          skippedVersion: '2.0.0',
          skippedVersionDate: new Date().toISOString(),
        }),
      };

      await firstValueFrom(service.showUpdatesIfNotSkipped());

      expect(dialogServiceMock.open).not.toHaveBeenCalled();
    });

    it('should open dialog when version is skipped but skip period expired', async () => {
      const mockUpdates: AppUpdateInfo[] = [{ version: '2.0.0', note: 'Major release' }];
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
      (window as any).UPDATE_API = {
        ...originalUpdateApi,
        getUpdateInfo: vi.fn().mockResolvedValue(mockUpdates),
        getPreferences: vi.fn().mockResolvedValue({
          skippedVersion: '2.0.0',
          skippedVersionDate: fortyDaysAgo,
        }),
        updateApp: vi.fn().mockResolvedValue(undefined),
      };

      await firstValueFrom(service.showUpdatesIfNotSkipped());

      expect(dialogServiceMock.open).toHaveBeenCalled();
    });
  });
});
