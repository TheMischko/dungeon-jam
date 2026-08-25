import { Injectable } from '@angular/core';
import { PlaylistApiWindow } from '../../../models/api/playlist-api.model';
import { QueryRequest } from '@shared/models/request.model';
import { Observable, Subject } from 'rxjs';
import {
  Playlist,
  PlaylistAddTracksData,
  PlaylistInsertQuery,
  PlaylistOrderContext,
  PlaylistUpdateQuery,
} from '@shared/models/playlist.model';
import { DisplayOrderPlacement } from '@shared/models/display-order.model';

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

  getById(playlistId: string): Observable<Playlist | null> {
    const subject = new Subject<Playlist>();
    this.window.PLAYLIST_API.getPlaylistById(playlistId)
      .then((playlist) => {
        subject.next(playlist);
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

  addTracks(data: PlaylistAddTracksData): Observable<Map<string, Playlist>> {
    const subject = new Subject<Map<string, Playlist>>();
    this.window.PLAYLIST_API.addTracksToPlaylists(data)
      .then((playlistMap) => {
        subject.next(playlistMap);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  updatePlaylist(query: PlaylistUpdateQuery): Observable<Playlist> {
    const subject = new Subject<Playlist>();
    this.window.PLAYLIST_API.updatePlaylist(query)
      .then((playlist) => {
        subject.next(playlist);
        subject.complete();
      })
      .catch((error) => {
        subject.error(error);
      });
    return subject.asObservable();
  }

  removeTracks(playlistId: string, trackIds: string[]): Observable<Playlist> {
    return this.updatePlaylist({
      id: playlistId,
      tracksRemoved: trackIds,
    });
  }

  reorderPlaylist(
    playlistId: string,
    newOrder: number,
    context: PlaylistOrderContext,
    parentId?: string
  ): Observable<void> {
    const subject = new Subject<void>();
    this.window.PLAYLIST_API.changePlaylistOrder({
      playlistId,
      newOrder,
      contextType: context,
      contextId: parentId,
    })
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });
    return subject;
  }

  reorderPlaylistRelative(
    playlistId: string,
    anchorEntityId: string | undefined,
    placement: DisplayOrderPlacement,
    context: PlaylistOrderContext,
    parentId?: string
  ): Observable<void> {
    const subject = new Subject<void>();
    this.window.PLAYLIST_API.changePlaylistRelativeOrder({
      entityId: playlistId,
      anchorEntityId,
      placement,
      contextType: context,
      contextId: parentId,
    })
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });
    return subject;
  }

  deletePlaylist(playlistId: string): Observable<void> {
    const subject = new Subject<void>();
    this.window.PLAYLIST_API.deletePlaylist(playlistId)
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });
    return subject.asObservable();
  }
}
