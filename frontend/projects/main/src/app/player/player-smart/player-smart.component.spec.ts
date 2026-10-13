import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerSmartComponent } from './player-smart.component';
import { TrackHighlightService } from '../../services/track-highlight.service';
import { RedirectService } from '@general';
import { PlaybackService } from '../../services/playback.service';
import { initialPlaybackState } from '../../models/playback.model';
import { Track } from '@shared/models/track.model';
import { RedirectPath } from '@shared/models/redirect.model';

describe('PlayerSmartComponent', () => {
  let component: PlayerSmartComponent;
  let fixture: ComponentFixture<PlayerSmartComponent>;
  let trackHighlightService: TrackHighlightService;
  let redirectService: RedirectService;
  let playbackService: PlaybackService;

  const mockTrack: Track = {
    id: 'track-1',
    name: 'Test Track',
    url: 'http://example.com/track.mp3',
    duration: 120,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerSmartComponent);
    component = fixture.componentInstance;
    trackHighlightService = TestBed.inject(TrackHighlightService);
    redirectService = TestBed.inject(RedirectService);
    playbackService = TestBed.inject(PlaybackService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('navigateToActiveTrack', () => {
    it('should do nothing if there is no active track', () => {
      const setSessionSpy = vi.spyOn(
        trackHighlightService,
        'setSessionHighlightedTrack'
      );
      const setSceneSpy = vi.spyOn(
        trackHighlightService,
        'setSceneHighlightedTrack'
      );
      const setPlaylistSpy = vi.spyOn(
        trackHighlightService,
        'setPlaylistHighlightedTrack'
      );
      const setLibrarySpy = vi.spyOn(
        trackHighlightService,
        'setLibraryHighlightedTrack'
      );
      const redirectSpy = vi.spyOn(redirectService, 'triggerRedirect');

      (playbackService as any).state.next({
        ...initialPlaybackState,
        currentTrack: null,
      });
      fixture.detectChanges();

      (component as any).navigateToActiveTrack();

      expect(setSessionSpy).not.toHaveBeenCalled();
      expect(setSceneSpy).not.toHaveBeenCalled();
      expect(setPlaylistSpy).not.toHaveBeenCalled();
      expect(setLibrarySpy).not.toHaveBeenCalled();
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('should set session highlighted track and redirect to sessions when sessionId is present', () => {
      const setSessionSpy = vi.spyOn(
        trackHighlightService,
        'setSessionHighlightedTrack'
      );
      const redirectSpy = vi.spyOn(redirectService, 'triggerRedirect');

      (playbackService as any).state.next({
        ...initialPlaybackState,
        currentTrack: mockTrack,
        sessionId: 'session-123',
      });
      fixture.detectChanges();

      (component as any).navigateToActiveTrack();

      expect(setSessionSpy).toHaveBeenCalledWith('track-1', 'session-123');
      expect(redirectSpy).toHaveBeenCalledWith({
        path: RedirectPath.SESSIONS,
        params: { sessionId: 'session-123' },
      });
    });

    it('should set scene highlighted track and redirect to scenes when sceneId is present without sessionId', () => {
      const setSceneSpy = vi.spyOn(
        trackHighlightService,
        'setSceneHighlightedTrack'
      );
      const redirectSpy = vi.spyOn(redirectService, 'triggerRedirect');

      (playbackService as any).state.next({
        ...initialPlaybackState,
        currentTrack: mockTrack,
        sceneId: 'scene-123',
      });
      fixture.detectChanges();

      (component as any).navigateToActiveTrack();

      expect(setSceneSpy).toHaveBeenCalledWith('track-1', 'scene-123');
      expect(redirectSpy).toHaveBeenCalledWith({
        path: RedirectPath.SCENES,
        params: { sceneId: 'scene-123' },
      });
    });

    it('should set playlist highlighted track and redirect to playlists when playlistId is present without sessionId or sceneId', () => {
      const setPlaylistSpy = vi.spyOn(
        trackHighlightService,
        'setPlaylistHighlightedTrack'
      );
      const redirectSpy = vi.spyOn(redirectService, 'triggerRedirect');

      (playbackService as any).state.next({
        ...initialPlaybackState,
        currentTrack: mockTrack,
        playlistId: 'playlist-123',
      });
      fixture.detectChanges();

      (component as any).navigateToActiveTrack();

      expect(setPlaylistSpy).toHaveBeenCalledWith('track-1', 'playlist-123');
      expect(redirectSpy).toHaveBeenCalledWith({
        path: RedirectPath.PLAYLISTS,
        params: { playlistId: 'playlist-123' },
      });
    });

    it('should set library highlighted track and redirect to library when only currentTrack is present', () => {
      const setLibrarySpy = vi.spyOn(
        trackHighlightService,
        'setLibraryHighlightedTrack'
      );
      const redirectSpy = vi.spyOn(redirectService, 'triggerRedirect');

      (playbackService as any).state.next({
        ...initialPlaybackState,
        currentTrack: mockTrack,
        sessionId: undefined,
        sceneId: undefined,
        playlistId: undefined,
      });
      fixture.detectChanges();

      (component as any).navigateToActiveTrack();

      expect(setLibrarySpy).toHaveBeenCalledWith('track-1');
      expect(redirectSpy).toHaveBeenCalledWith({
        path: RedirectPath.LIBRARY,
      });
    });
  });
});
