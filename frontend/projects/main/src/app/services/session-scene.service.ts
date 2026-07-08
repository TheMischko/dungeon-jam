import { inject, Injectable } from '@angular/core';
import { SessionApiService } from '@general/services/session-api.service';
import { SessionData } from '@shared/models/session.model';
import { SceneApiService } from '@general/services/scene-api.service';
import { QueryOptions } from '@shared/models/request.model';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { Scene } from '@shared/models/scene.model';

@Injectable({
  providedIn: 'root',
})
export class SessionSceneService {
  private readonly sessionApi = inject(SessionApiService);
  private readonly sceneApi = inject(SceneApiService);

  getAvailableScenesForSession(
    session: SessionData,
    query: QueryOptions = {}
  ): Observable<Scene[]> {
    const sessionSceneIds = this.getSessionSceneIds(session);
    return this.sceneApi.getAll(query).pipe(
      map((scenes) => {
        return scenes.filter((scene) => !sessionSceneIds.includes(scene.id));
      })
    );
  }

  getAssignedScenesForSession(session: SessionData): Observable<Scene[]> {
    const sessionSceneIds = this.getSessionSceneIds(session);
    const sceneOrderMap = new Map(
      session.scenes.map((ref) => [ref.sceneId, ref.order])
    );
    return this.sceneApi.getAll({}).pipe(
      map((scenes) => {
        return scenes
          .filter((scene) => sessionSceneIds.includes(scene.id))
          .sort((a, b) => {
            const orderA = sceneOrderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
            const orderB = sceneOrderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
      })
    );
  }

  updateAssignedScenesForSession(
    session: SessionData,
    assignments: Scene[]
  ): Observable<SessionData> {
    const newAssignedScenes = assignments.filter(
      (scene) =>
        session.scenes.find((ref) => ref.sceneId === scene.id) === undefined
    );
    const removedSceneIds = session.scenes
      .filter(
        (ref) =>
          assignments.find((scene) => scene.id === ref.sceneId) === undefined
      )
      .map((ref) => ref.sceneId);

    return this.unassignScenesFromSession(session, removedSceneIds).pipe(
      switchMap(() => {
        return this.assignScenesToSession(
          session,
          newAssignedScenes.map((scene) => scene.id)
        );
      }),
      switchMap(() => {
        return this.sessionApi.update({
          id: session.id,
          scenesReordered: assignments.map((scene) => scene.id),
        });
      }),
      switchMap(() => {
        return this.sessionApi
          .getById(session.id)
          .pipe(filter((session) => !!session));
      })
    );
  }

  assignScenesToSession(
    session: SessionData,
    sceneIds: string[]
  ): Observable<SessionData> {
    const sessionSceneIds = this.getSessionSceneIds(session);
    const newSceneIds = sceneIds.filter(
      (sceneId) => !sessionSceneIds.includes(sceneId)
    );
    if (newSceneIds.length === 0) {
      return of(session);
    }
    const newOrder = session.scenes.length ?? 0;
    return this.sessionApi.update({
      id: session.id,
      scenesAdded: newSceneIds.map((sceneId, index) => {
        return {
          sceneId,
          order: newOrder + index,
        };
      }),
    });
  }

  unassignScenesFromSession(
    session: SessionData,
    sceneIds: string[]
  ): Observable<SessionData> {
    if (sceneIds.length === 0) {
      return of(session);
    }
    return this.sessionApi.update({
      id: session.id,
      scenesRemoved: sceneIds,
    });
  }

  private getSessionSceneIds(session: SessionData): string[] {
    return session.scenes.map((ref) => ref.sceneId);
  }
}
