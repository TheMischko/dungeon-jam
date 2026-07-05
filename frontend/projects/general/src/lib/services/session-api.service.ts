import { Injectable } from '@angular/core';
import { SessionWindow } from '../../../models/api/session-api.model';
import { QueryOptions } from '@shared/models/request.model';
import { Observable, Subject } from 'rxjs';
import {
  SessionData,
  SessionInsertQuery,
  SessionScenesQuery,
  SessionUpdateQuery,
} from '@shared/models/session.model';
import { Scene } from '@shared/models/scene.model';

@Injectable({
  providedIn: 'root',
})
export class SessionApiService {
  private readonly window = <SessionWindow>window;

  getAll(query: QueryOptions): Observable<SessionData[]> {
    const subject = new Subject<SessionData[]>();
    this.window.SESSION_API.getAllSessions(query)
      .then((r) => {
        subject.next(r);
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }

  getById(sessionId: string): Observable<SessionData | null> {
    const subject = new Subject<SessionData | null>();
    this.window.SESSION_API.getSessionById(sessionId)
      .then((r) => {
        subject.next(r);
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }

  insert(data: SessionInsertQuery): Observable<SessionData> {
    const subject = new Subject<SessionData>();
    this.window.SESSION_API.insertSession(data)
      .then((r) => {
        subject.next(r);
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }

  update(data: SessionUpdateQuery): Observable<SessionData> {
    const subject = new Subject<SessionData>();
    this.window.SESSION_API.updateSession(data)
      .then((r) => {
        subject.next(r);
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }

  delete(sessionId: string): Observable<void> {
    const subject = new Subject<void>();
    this.window.SESSION_API.getSessionById(sessionId)
      .then(() => {
        subject.next();
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }

  getSessionScenes(query: SessionScenesQuery): Observable<Scene[]> {
    const subject = new Subject<Scene[]>();
    this.window.SESSION_API.getSessionScenes(query)
      .then((r) => {
        subject.next(r);
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
        subject.complete();
      });
    return subject.asObservable();
  }
}
