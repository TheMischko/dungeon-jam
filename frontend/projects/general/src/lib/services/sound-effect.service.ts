import { Injectable } from '@angular/core';
import { SoundEffectApiWindow } from '../../../models/api/sound-effect-api.model';
import { QueryOptions } from '@shared/models/request.model';
import { Observable, Subject } from 'rxjs';
import {
  SoundEffect,
  SoundEffectCreateData,
  SoundEffectUpdateData,
} from '@shared/models/sound-effect.model';

@Injectable({
  providedIn: 'root',
})
export class SoundEffectService {
  private readonly window: SoundEffectApiWindow = <SoundEffectApiWindow>window;

  public getAll(query: QueryOptions): Observable<SoundEffect[]> {
    const subject = new Subject<SoundEffect[]>();
    this.window.SOUND_EFFECT_API.getAll(query)
      .then((response) => subject.next(response))
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        subject.complete();
      });
    return subject.asObservable();
  }

  public getById(id: string): Observable<SoundEffect | null> {
    const subject = new Subject<SoundEffect | null>();
    this.window.SOUND_EFFECT_API.getById(id)
      .then((response) => subject.next(response))
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        subject.complete();
      });
    return subject.asObservable();
  }

  public create(data: SoundEffectCreateData): Observable<SoundEffect> {
    const subject = new Subject<SoundEffect>();
    this.window.SOUND_EFFECT_API.create(data)
      .then((response) => subject.next(response))
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        subject.complete();
      });
    return subject.asObservable();
  }

  public update(data: SoundEffectUpdateData): Observable<SoundEffect | null> {
    const subject = new Subject<SoundEffect | null>();
    this.window.SOUND_EFFECT_API.update(data)
      .then((response) => subject.next(response))
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        subject.complete();
      });
    return subject.asObservable();
  }

  public deleteById(id: string): Observable<void> {
    const subject = new Subject<void>();
    this.window.SOUND_EFFECT_API.deleteById(id)
      .then(() => {
        subject.next();
      })
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        subject.complete();
      });
    return subject.asObservable();
  }
}
