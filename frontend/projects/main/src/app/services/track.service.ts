import { Injectable } from '@angular/core';
import { AudioApiWindow } from '../models/window-api.model';
import { PlaylistTracksQuery, TaggedTracksQuery, Track } from '@shared/models/track.model';
import { map, Observable, Subject } from 'rxjs';
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

  updateTrack(track: Track): Observable<Track> {
    const subject = new Subject<Track>();
    this.window.TRACK_API.updateTrack(track)
      .then((updatedTrack) => {
        subject.next(updatedTrack);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  deleteTrack(id: string): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.window.TRACK_API.deleteTrack(id)
      .then((success) => {
        subject.next(success);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  findDuplicates(paths: string[]): Observable<{ path: string, track: Track | null}[]> {
    return this.getAllTracks().pipe(
      map((tracks) => {
        const trackMap = new Map<string, Track>();
        tracks.forEach(track => trackMap.set(track.url, track));
        return paths.map(path => ({
          path,
          track: trackMap.get(path) || null
        }));
      })
    )
  }

  getTaggedTracks(query: TaggedTracksQuery): Observable<Track[]> {
    const subject = new Subject<Track[]>();
    this.window.TRACK_API.getTaggedTracks(query)
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
