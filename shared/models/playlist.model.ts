import { TagData } from '@shared/models/tag.model';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  imageUrl?: string;
  trackIds: string[];
  order: number;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface PlaylistInsertQuery {
  name: string;
  description?: string;
  imageUrl?: string;
  tags: TagData[];
}

export interface PlaylistUpdateQuery {
  id: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  order?: number;
  tagsAdded?: string[];
  tagsRemoved?: string[];
  tracksAdded?: string[];
  tracksRemoved?: string[];
}

/**
 * Collection of track IDs under playlist ID keys.
 */
export type PlaylistAddTracksData = { [playlistId: string]: string[] };
