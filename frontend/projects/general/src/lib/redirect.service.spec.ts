import { TestBed } from '@angular/core/testing';
import { RedirectService } from './redirect.service';
import { RedirectPath, RedirectRequest } from '@shared/models/redirect.model';

describe('RedirectService', () => {
  let service: RedirectService;
  let redirectCallback: (request: RedirectRequest) => void | Promise<void>;

  beforeEach(() => {
    vi.spyOn(window.GENERAL_API, 'registerRedirect').mockImplementation(
      (callback) => {
        redirectCallback = callback;
      }
    );
    vi.spyOn(window.GENERAL_API, 'triggerRedirect');

    TestBed.configureTestingModule({});
    service = TestBed.inject(RedirectService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the previous redirect as the latest history record', () => {
    let latestHistory: RedirectRequest | null = null;
    service.latestHistoryRecord$.subscribe((request) => {
      latestHistory = request;
    });

    redirectCallback({ path: RedirectPath.HOME });
    redirectCallback({ path: RedirectPath.LIBRARY });

    expect(latestHistory).toEqual({ path: RedirectPath.HOME });
  });

  it('should navigate back without adding the restored route to history', () => {
    let latestHistory: RedirectRequest | null = null;
    service.latestHistoryRecord$.subscribe((request) => {
      latestHistory = request;
    });
    redirectCallback({ path: RedirectPath.HOME });
    redirectCallback({ path: RedirectPath.LIBRARY });
    redirectCallback({ path: RedirectPath.PLAYLISTS });

    service.navigateBack();

    expect(window.GENERAL_API.triggerRedirect).toHaveBeenCalledWith({
      path: RedirectPath.LIBRARY,
    });
    expect(latestHistory).toEqual({ path: RedirectPath.HOME });

    redirectCallback({ path: RedirectPath.LIBRARY });

    expect(latestHistory).toEqual({ path: RedirectPath.HOME });
  });

  it('should do nothing when there is no route to return to', () => {
    service.navigateBack();

    expect(window.GENERAL_API.triggerRedirect).not.toHaveBeenCalled();
  });
});
