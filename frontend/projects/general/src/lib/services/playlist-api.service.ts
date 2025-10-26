import { Injectable } from '@angular/core';
import { PlaylistApiWindow } from '../../../models/api/playlist-api.model';
import { QueryRequest } from '@shared/models/request.model';
import { Observable, Subject } from 'rxjs';
import { Playlist, PlaylistInsertQuery } from '@shared/models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistApiService {
  private readonly window = <PlaylistApiWindow>window;

  getAllPlaylists(options: QueryRequest): Observable<Playlist[]> {
    const subject = new Subject<Playlist[]>();
    this.window.PLAYLIST_API.getAllPlaylists(options)
      .then((playlists) => {
        subject.next(playlists);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  insertPlaylist(data: PlaylistInsertQuery): Observable<Playlist> {
    const subject = new Subject<Playlist>();
    this.window.PLAYLIST_API.insertPlaylist(data)
      .then((playlist) => {
        subject.next(playlist);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }
}
