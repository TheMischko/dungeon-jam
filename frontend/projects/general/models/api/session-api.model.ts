import { QueryOptions } from '@shared/models/request.model';
import {
  SessionData,
  SessionInsertQuery,
  SessionScenesQuery,
  SessionUpdateQuery,
} from '@shared/models/session.model';
import { Scene } from '@shared/models/scene.model';

export type SessionWindow = Window &
  typeof globalThis & {
    SESSION_API: {
      getAllSessions: (query: QueryOptions) => Promise<SessionData[]>;
      getSessionById: (sessionId: string) => Promise<SessionData | null>;
      insertSession: (insertQuery: SessionInsertQuery) => Promise<SessionData>;
      updateSession: (updateQuery: SessionUpdateQuery) => Promise<SessionData>;
      deleteSession: (sessionId: string) => Promise<void>;
      getSessionScenes: (query: SessionScenesQuery) => Promise<Scene[]>;
    };
  };
