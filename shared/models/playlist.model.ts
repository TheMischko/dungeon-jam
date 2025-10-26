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
  tags?: string[];
}
