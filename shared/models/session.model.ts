import { QueryOptions } from '@shared/models/request.model';

export interface SessionData {
  id: string;
  name: string;
  description?: string;
  dateOfSession?: Date;
  scenes: SessionSceneRef[];
  order: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface SessionInsertQuery {
  name: string;
  description?: string;
  dateOfSession?: Date;
}

export interface SessionUpdateQuery {
  id: string;
  name?: string;
  description?: string | null;
  dateOfSession?: Date | null;
  scenesAdded?: SessionSceneRef[];
  scenesRemoved?: string[];
  // IDs of scenes in new correct order
  scenesReordered?: string[];
}

export interface SessionScenesQuery {
  sessionId: string;
  query: QueryOptions;
}

export interface SessionSceneRef {
  sceneId: string;
  order: number;
}
