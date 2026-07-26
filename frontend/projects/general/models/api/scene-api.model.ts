import { QueryOptions } from '@shared/models/request.model';
import {
  Scene,
  SceneInsertQuery,
  SceneUpdateQuery,
} from '@shared/models/scene.model';

export type SceneApiWindow = Window &
  typeof globalThis & {
    SCENE_API: {
      getAllScenes: (query: QueryOptions) => Promise<Scene[]>;
      getSceneById: (id: string) => Promise<Scene | undefined>;
      insertScene: (data: SceneInsertQuery) => Promise<Scene>;
      updateScene: (data: SceneUpdateQuery) => Promise<Scene>;
      deleteScene: (id: string) => Promise<void>;
      changeScenesOrder: (sceneIds: string[]) => Promise<Scene[]>;
    };
  };
