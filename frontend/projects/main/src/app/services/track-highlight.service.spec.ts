import { TestBed } from '@angular/core/testing';
import { TrackHighlightService } from './track-highlight.service';
import {
  createLibraryContext,
  createPlaylistContext,
  createSceneContext,
  createSessionContext,
} from '../models/track-highlight.model';

describe('TrackHighlightService', () => {
  let service: TrackHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially emit undefined when subscribed', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createLibraryContext())
      .subscribe((id) => emissions.push(id));

    expect(emissions).toEqual([undefined]);
    sub.unsubscribe();
  });

  it('should emit trackId when playlist context matches', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createPlaylistContext('playlist-1'))
      .subscribe((id) => emissions.push(id));

    service.setPlaylistHighlightedTrack('track-100', 'playlist-1');

    expect(emissions).toEqual([undefined, 'track-100']);
    sub.unsubscribe();
  });

  it('should not emit trackId when playlist context does not match', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createPlaylistContext('playlist-1'))
      .subscribe((id) => emissions.push(id));

    service.setPlaylistHighlightedTrack('track-100', 'playlist-2');

    expect(emissions).toEqual([undefined]);
    sub.unsubscribe();
  });

  it('should emit trackId when scene context matches', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createSceneContext('scene-1'))
      .subscribe((id) => emissions.push(id));

    service.setSceneHighlightedTrack('track-200', 'scene-1');

    expect(emissions).toEqual([undefined, 'track-200']);
    sub.unsubscribe();
  });

  it('should not emit trackId when scene context does not match', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createSceneContext('scene-1'))
      .subscribe((id) => emissions.push(id));

    service.setSceneHighlightedTrack('track-200', 'scene-2');

    expect(emissions).toEqual([undefined]);
    sub.unsubscribe();
  });

  it('should emit trackId when session context matches', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createSessionContext('session-1'))
      .subscribe((id) => emissions.push(id));

    service.setSessionHighlightedTrack('track-300', 'session-1');

    expect(emissions).toEqual([undefined, 'track-300']);
    sub.unsubscribe();
  });

  it('should not emit trackId when session context does not match', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createSessionContext('session-1'))
      .subscribe((id) => emissions.push(id));

    service.setSessionHighlightedTrack('track-300', 'session-2');

    expect(emissions).toEqual([undefined]);
    sub.unsubscribe();
  });

  it('should emit trackId when library context matches', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createLibraryContext())
      .subscribe((id) => emissions.push(id));

    service.setLibraryHighlightedTrack('track-400');

    expect(emissions).toEqual([undefined, 'track-400']);
    sub.unsubscribe();
  });

  it('should not emit trackId across different context types', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createLibraryContext())
      .subscribe((id) => emissions.push(id));

    service.setPlaylistHighlightedTrack('track-100', 'playlist-1');
    service.setSceneHighlightedTrack('track-200', 'scene-1');
    service.setSessionHighlightedTrack('track-300', 'session-1');

    expect(emissions).toEqual([undefined]);
    sub.unsubscribe();
  });

  it('should emit undefined when resetHighlightTrackId is called', () => {
    const emissions: (string | undefined)[] = [];
    const sub = service
      .listenForHighlightedTrack(createPlaylistContext('playlist-1'))
      .subscribe((id) => emissions.push(id));

    service.setPlaylistHighlightedTrack('track-100', 'playlist-1');
    service.resetHighlightTrackId();

    expect(emissions).toEqual([undefined, 'track-100', undefined]);
    sub.unsubscribe();
  });
});
