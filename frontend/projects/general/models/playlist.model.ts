import { Playlist } from '@shared/models/playlist.model';
import { TagData } from '@shared/models/tag.model';

export type PlaylistWithTagData = Omit<Playlist, 'tags'> & {
  tags: TagData[];
};

export type PlaylistWithParent = Playlist & { parentPlaylist: Playlist};
export type PlaylistViewDataWithParent = PlaylistWithTagData & { parentPlaylist: Playlist};
