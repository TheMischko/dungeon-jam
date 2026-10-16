import { Service } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import {
  TrackHighlightContext,
  TrackHighlightRequest,
  TrackHighlightType,
} from '../models/track-highlight.model';

@Service()
export class TrackHighlightService {
  private readonly highlightedTrackRequest = new BehaviorSubject<
    TrackHighlightRequest | undefined
  >(undefined);

  public listenForHighlightedTrack(
    context: TrackHighlightContext
  ): Observable<string | undefined> {
    return this.highlightedTrackRequest.asObservable().pipe(
      filter((request) => {
        if (!request) {
          return true;
        }
        return this.contextEquals(request.context, context);
      }),
      map((request) => request?.trackId)
    );
  }

  public setPlaylistHighlightedTrack(
    trackId: string,
    playlistId: string
  ): void {
    this.highlightedTrackRequest.next({
      context: { type: TrackHighlightType.PLAYLIST, playlistId },
      trackId,
    });
  }

  public setSceneHighlightedTrack(trackId: string, sceneId: string): void {
    this.highlightedTrackRequest.next({
      context: { type: TrackHighlightType.SCENE, sceneId },
      trackId,
    });
  }

  public setSessionHighlightedTrack(trackId: string, sessionId: string): void {
    this.highlightedTrackRequest.next({
      context: { type: TrackHighlightType.SESSION, sessionId },
      trackId,
    });
  }

  public setLibraryHighlightedTrack(trackId: string): void {
    this.highlightedTrackRequest.next({
      context: { type: TrackHighlightType.LIBRARY },
      trackId,
    });
  }

  public resetHighlightTrackId(): void {
    this.highlightedTrackRequest.next(undefined);
  }

  private contextEquals(
    contextA: TrackHighlightContext,
    contextB: TrackHighlightContext
  ): boolean {
    if (!contextA || !contextB) {
      return false;
    }
    switch (contextA.type) {
      case TrackHighlightType.LIBRARY:
        return contextA.type === contextB.type;
      case TrackHighlightType.PLAYLIST:
        return (
          contextB.type === TrackHighlightType.PLAYLIST &&
          contextA.playlistId === contextB.playlistId
        );
      case TrackHighlightType.SCENE:
        return (
          contextB.type === TrackHighlightType.SCENE &&
          contextA.sceneId === contextB.sceneId
        );
      case TrackHighlightType.SESSION:
        return (
          contextB.type === TrackHighlightType.SESSION &&
          contextA.sessionId === contextB.sessionId
        );
      default:
        return false;
    }
  }
}
