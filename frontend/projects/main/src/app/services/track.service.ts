import { Injectable } from '@angular/core';
import { AudioApiWindow } from '../models/window-api.model';
import { PlaylistTracksQuery, Track } from '@shared/models/track.model';
import { Observable, Subject } from 'rxjs';
import { QueryRequest } from '@shared/models/request.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private readonly window = <AudioApiWindow>window;

  constructor() {}

  getAllTracks(query?: QueryRequest): Observable<Track[]> {
    const subject = new Subject<Track[]>();
    this.window.TRACK_API.getAllTracks(query)
      .then((tracks) => {
        subject.next(tracks);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  getTracksByPlaylist(query: PlaylistTracksQuery): Observable<Track[]> {
    const subject = new Subject<Track[]>();
    this.window.TRACK_API.getTracksByPlaylist(query)
      .then((tracks) => {
        subject.next(tracks);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }
}
