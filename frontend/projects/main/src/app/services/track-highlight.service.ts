import { Service } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
export class TrackHighlightService {
  private readonly highlightedTrackId = new BehaviorSubject<string | undefined>(
    undefined
  );

  public get highlightTrackId$(): Observable<string | undefined> {
    return this.highlightedTrackId.asObservable();
  }

  public setHighlightedTrackId(trackId: string): void {
    this.highlightedTrackId.next(trackId);
  }

  public resetHighlightTrackId(): void {
    this.highlightedTrackId.next(undefined);
  }
}
