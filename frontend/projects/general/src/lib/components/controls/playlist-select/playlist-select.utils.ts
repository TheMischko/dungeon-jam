import { Playlist } from '@shared/models/playlist.model';

export type PlaylistSelectOption = {
  playlist: Playlist;
  depth: number;
};

export const sortAndGroupPlaylists = (
  playlists: Playlist[]
): PlaylistSelectOption[] => {
  const idMap = new Map<string, Playlist>(playlists.map((p) => [p.id, p]));

  const topLevel = playlists
    .filter((playlist) => !playlist.ownershipId)
    .sort(sortByName);

  const result: PlaylistSelectOption[] = [];
  topLevel.forEach((playlist) => {
    const playlistsOrdered = sortAndGroup(playlist, idMap);
    playlistsOrdered.forEach((p) => result.push(p));
  });

  return result;
};

const sortAndGroup = (
  playlist: Playlist,
  playlistMap: Map<string, Playlist>,
  currentDepth: number = 0
): PlaylistSelectOption[] => {
  const children =
    playlist.childrenIds
      ?.map((c) => playlistMap.get(c))
      .filter((c) => !!c)
      .sort(sortByName) || [];
  const result = [{ playlist, depth: currentDepth }];
  if (children.length === 0) {
    return result;
  }

  for (let child of children) {
    const childrenResult = sortAndGroup(child, playlistMap, currentDepth + 1);
    childrenResult.forEach((child) => {
      result.push(child);
    });
  }

  return result;
};

const sortByName = (a: Playlist, b: Playlist) => a.name.localeCompare(b.name);
