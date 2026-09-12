import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongsTableComponent } from './songs-table.component';
import { TrackHighlightService } from '../../../../../services/track-highlight.service';
import { Track } from '@shared/models/track.model';
import {
  createLibraryContext,
  createPlaylistContext,
} from '../../../../../models/track-highlight.model';

describe('SongsTableComponent', () => {
  let component: SongsTableComponent;
  let fixture: ComponentFixture<SongsTableComponent>;
  let trackHighlightService: TrackHighlightService;

  const createMockTracks = (count: number): Track[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `track-${i}`,
      name: `Track ${i}`,
      url: `http://example.com/track-${i}.mp3`,
      duration: 180,
    }));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SongsTableComponent);
    component = fixture.componentInstance;
    trackHighlightService = TestBed.inject(TrackHighlightService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('track highlighting and pagination', () => {
    it('should navigate to page containing highlighted track and reset highlight', () => {
      const tracks = createMockTracks(35);
      fixture.componentRef.setInput('tracks', tracks);
      fixture.componentRef.setInput('initialPageSize', 10);
      fixture.componentRef.setInput('highlightContext', createLibraryContext());
      fixture.detectChanges();

      expect(component.paginationService.currentPageIndex()).toBe(0);

      const resetSpy = vi.spyOn(
        trackHighlightService,
        'resetHighlightTrackId'
      );

      // Track 25 should be on page 2 (index 25 / 10 = 2)
      trackHighlightService.setLibraryHighlightedTrack('track-25');
      fixture.detectChanges();

      expect(component.paginationService.currentPageIndex()).toBe(2);
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should handle non-existent track ID gracefully without changing page or infinite looping', () => {
      const tracks = createMockTracks(35);
      fixture.componentRef.setInput('tracks', tracks);
      fixture.componentRef.setInput('initialPageSize', 10);
      fixture.componentRef.setInput('highlightContext', createLibraryContext());
      fixture.detectChanges();

      expect(component.paginationService.currentPageIndex()).toBe(0);

      const resetSpy = vi.spyOn(
        trackHighlightService,
        'resetHighlightTrackId'
      );

      trackHighlightService.setLibraryHighlightedTrack('non-existent-track');
      fixture.detectChanges();

      expect(component.paginationService.currentPageIndex()).toBe(0);
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should ignore highlights for different contexts', () => {
      const tracks = createMockTracks(35);
      fixture.componentRef.setInput('tracks', tracks);
      fixture.componentRef.setInput('initialPageSize', 10);
      fixture.componentRef.setInput(
        'highlightContext',
        createPlaylistContext('playlist-1')
      );
      fixture.detectChanges();

      const resetSpy = vi.spyOn(
        trackHighlightService,
        'resetHighlightTrackId'
      );

      // Highlight for different playlist
      trackHighlightService.setPlaylistHighlightedTrack(
        'track-25',
        'playlist-2'
      );
      fixture.detectChanges();

      expect(component.paginationService.currentPageIndex()).toBe(0);
      expect(resetSpy).not.toHaveBeenCalled();
    });
  });
});
