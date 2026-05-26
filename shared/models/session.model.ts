export interface Session {
  id: string;
  name: string;
  description?: string;
  dateOfSession?: Date;
  sceneIds: string[];
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
  description?: string | null;
  dateOfSession?: Date | null;
  scenesAdded?: string[];
  scenesRemoved?: string[];
  // Overrides current scenes
  sceneIds?: string[];
}
