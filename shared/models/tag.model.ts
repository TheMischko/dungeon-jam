import { Track } from '@shared/models/track.model';
import { Playlist } from '@shared/models/playlist.model';

export interface Tag {
  title: string;
  color?: string;
}

export interface TagData extends Tag {
  id: string;
}

export interface TagDetail extends TagData {
  assignedTracks: Track[];
  assignedPlaylists: Playlist[];
}