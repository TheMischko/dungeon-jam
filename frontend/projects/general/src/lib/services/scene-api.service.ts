import { Injectable } from '@angular/core';
import { SceneApiWindow } from '../../../models/api/scene-api.model';
import { Observable, Subject } from 'rxjs';
import { Scene, SceneInsertQuery, SceneUpdateQuery } from '@shared/models/scene.model';
import { QueryOptions } from '@shared/models/request.model';

@Injectable({
  providedIn: 'root',
})
export class SceneApiService {
  private readonly window = <SceneApiWindow>window;

  public getAll(options: QueryOptions): Observable<Scene[]> {
    const subject = new Subject<Scene[]>();

    this.window.SCENE_API.getAllScenes(options)
      .then((scenes) => {
        subject.next(scenes);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }

  public getById(id: string): Observable<Scene | undefined> {
    const subject = new Subject<Scene | undefined>();

    this.window.SCENE_API.getSceneById(id)
      .then((scene) => {
        subject.next(scene);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }

  public insert(data: SceneInsertQuery): Observable<Scene> {
    const subject = new Subject<Scene>();

    this.window.SCENE_API.insertScene(data)
      .then((scene) => {
        subject.next(scene);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }

  public update(data: SceneUpdateQuery): Observable<Scene> {
    const subject = new Subject<Scene>();

    this.window.SCENE_API.updateScene(data)
      .then((scene) => {
        subject.next(scene);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }

  public delete(id: string): Observable<void> {
    const subject = new Subject<void>();

    this.window.SCENE_API.deleteScene(id)
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

  public changeOrder(sceneIds: string[]): Observable<Scene[]> {
    const subject = new Subject<Scene[]>();

    this.window.SCENE_API.changeScenesOrder(sceneIds)
      .then((scenes) => {
        subject.next(scenes);
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
        subject.complete();
      });

    return subject.asObservable();
  }
}
