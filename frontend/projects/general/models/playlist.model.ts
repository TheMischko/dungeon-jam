import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';

export type PlaylistViewData = Omit<Playlist, 'tags'> & {
  tags: TagData[];
};
