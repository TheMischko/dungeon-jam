export interface Scene {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  playlistId: string | null;
  introTrackIds: string[];
  ambience: SceneSoundEffectRef[];
  stingers: SceneSoundEffectRef[];
  order: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface SceneSoundEffectRef {
  soundEffectId: string;
  volume: number;
}

export interface SceneInsertQuery {
  name: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  playlistId?: string;
}

export interface SceneUpdateQuery {
  id: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  playlistId?: string | null;
  introTrackIds?: string[];
  ambienceAdded?: string[];
  ambienceRemoved?: string[];
  ambienceVolumeUpdate?: SceneSoundEffectRef;
  stingersAdded?: string[];
  stingersRemoved?: string[];
  stingerVolumeUpdate?: SceneSoundEffectRef;
  tagsAdded?: string[];
  tagsRemoved?: string[];
}
