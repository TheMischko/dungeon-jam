import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReturnBackButtonComponent } from './return-back-button.component';
import { RedirectService } from '@general';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { RedirectPath, RedirectRequest } from '@shared/models/redirect.model';
import { PlaylistApiService } from '@general/services/playlist-api.service';
import { SceneApiService } from '@general/services/scene-api.service';
import { SessionApiService } from '@general/services/session-api.service';
import { Playlist } from '@shared/models/playlist.model';

describe('ReturnBackButtonComponent', () => {
  let component: ReturnBackButtonComponent;
  let fixture: ComponentFixture<ReturnBackButtonComponent>;
  let historySubject: BehaviorSubject<RedirectRequest | null>;
  let redirectService: {
    latestHistoryRecord$: BehaviorSubject<RedirectRequest | null>;
    navigateBack: ReturnType<typeof vi.fn>;
    triggerRedirect: ReturnType<typeof vi.fn>;
  };
  let playlistApiService: {
    getById: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    historySubject = new BehaviorSubject<RedirectRequest | null>(null);
    redirectService = {
      latestHistoryRecord$: historySubject,
      navigateBack: vi.fn(),
      triggerRedirect: vi.fn(),
    };
    playlistApiService = {
      getById: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReturnBackButtonComponent],
      providers: [
        { provide: RedirectService, useValue: redirectService },
        { provide: PlaylistApiService, useValue: playlistApiService },
        { provide: SceneApiService, useValue: { getById: vi.fn() } },
        { provide: SessionApiService, useValue: { getById: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnBackButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should stay hidden when there is no route to return to', () => {
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('should use fallback navigation when history is empty', async () => {
    const redirect = {
      path: RedirectPath.PLAYLISTS,
      params: { playlistId: 'parent-playlist' },
    };
    fixture.componentRef.setInput('noHistoryNavigation', {
      redirect,
      text: 'Back to Parent Playlist',
    });
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.textContent).toContain('Back to Parent Playlist');

    link.click();

    expect(redirectService.triggerRedirect).toHaveBeenCalledWith(redirect);
    expect(redirectService.navigateBack).not.toHaveBeenCalled();
  });

  it('should show a static label and navigate back when clicked', async () => {
    historySubject.next({ path: RedirectPath.HOME });
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.textContent).toContain('Back to Home');

    link.click();

    expect(redirectService.navigateBack).toHaveBeenCalledOnce();
  });

  it('should use the playlist name in the label', async () => {
    const playlist: Playlist = {
      id: 'playlist-1',
      name: 'Road Trip',
      tags: [],
      trackIds: [],
      order: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };
    playlistApiService.getById.mockReturnValue(of(playlist));

    historySubject.next({
      path: RedirectPath.PLAYLISTS,
      params: { playlistId: playlist.id },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(playlistApiService.getById).toHaveBeenCalledWith(playlist.id);
    expect(fixture.nativeElement.textContent).toContain('Back to Road Trip');
  });

  it('should ignore a stale entity label', async () => {
    const playlistSubject = new Subject<Playlist | null>();
    playlistApiService.getById.mockReturnValue(playlistSubject);

    historySubject.next({
      path: RedirectPath.PLAYLISTS,
      params: { playlistId: 'playlist-1' },
    });
    fixture.detectChanges();
    historySubject.next({ path: RedirectPath.HOME });
    fixture.detectChanges();
    await Promise.resolve();
    playlistSubject.next({
      id: 'playlist-1',
      name: 'Stale Playlist',
      tags: [],
      trackIds: [],
      order: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    playlistSubject.complete();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Back to Home');
    expect(fixture.nativeElement.textContent).not.toContain('Stale Playlist');
  });

  it('should hide the link and report entity lookup failures', async () => {
    const error = new Error('Playlist lookup failed');
    playlistApiService.getById.mockReturnValue(throwError(() => error));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    historySubject.next({
      path: RedirectPath.PLAYLISTS,
      params: { playlistId: 'playlist-1' },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Failed to resolve back navigation label',
      error
    );
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });
});
